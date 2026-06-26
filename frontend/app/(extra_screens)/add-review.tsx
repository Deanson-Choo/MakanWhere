import { Location } from "../../services/mapbox";
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from "expo-router";
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import StarRating from 'react-native-star-rating-widget';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SingleChipSelector from '@/components/SingleChipSelector';
import MultiChipSelector from "@/components/MultiChipSelector";
import { createReview, updateReview, type ReviewEntry, type AmountSpent, type MealType, type UpdateReviewBody } from "../../services/reviews";

import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";

const MEAL_TYPES: MealType[] = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Supper'];
const AMOUNT_OPTIONS: AmountSpent[] = ['1-10', '10-20', '20-30', '30-40', '40-50', '>50'];
const TAG_OPTIONS = ['Cafe', 'Study-Friendly', 'Halal', 'Pet-Friendly', 'Vegan', 'Date-Night'];


// This functions handles both adding a new review and editing an existing review. If a review is passed in the params, it will be in edit mode, otherwise it will be in add mode.
export default function AddReview() {
    const { location, review } = useLocalSearchParams<{ location?: string | string[], review?: string }>();

    const locationParam = Array.isArray(location) ? location[0] : location;

    let parsedLocation: Location | null = null;
    if (locationParam) {
        try {
            parsedLocation = JSON.parse(locationParam) as Location;
        } catch {
            parsedLocation = null;
        }
    }

    let parsedReview: ReviewEntry | null = null;
    if (review) {
        try {
            parsedReview = JSON.parse(review) as ReviewEntry;
        } catch {
            parsedReview = null;
        }
    }

    const isEditMode = parsedReview !== null;
    
    const [foodRating, setFoodRating] = useState(parsedReview?.food_rating ?? 0);
    const [atmosphereRating, setAtmosphereRating] = useState(parsedReview?.atmosphere_rating ?? 0);
    const [worthItRating, setWorthItRating] = useState(parsedReview?.worth_it_rating ?? 0);
    const [photos, setPhotos] = useState<string[]>(parsedReview?.image_urls ?? []); // Array of photo URLs
    const [mealType, setMealType] = useState<MealType | null>(parsedReview?.meal_type ?? null); // Single Selection
    const [amountSpent, setAmountSpent] = useState<AmountSpent | null>(parsedReview?.amount_spent ?? null); // Single Selection
    const [tags, setTags] = useState<string[] | null>(parsedReview?.tags ?? null); // Multi Selection
    const [remarks, setRemarks] = useState<string | null>(parsedReview?.remarks ?? null);


    // Image related functions
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Please grant camera roll permissions to select images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            selectionLimit: 5, // Limit to 5 images
            aspect: [4, 3], // Change as needed
            quality: 0.3,
            base64: true
        });

        if (result.canceled || !result.assets?.length) return;

        const newPhotos = result.assets
            .filter(asset => asset.base64)
            .map(asset => {
                const mimeType = asset.mimeType ?? 'image/jpeg';
                return `data:${mimeType};base64,${asset.base64}`;
            });
        if (newPhotos.length > 0) {
            setPhotos(newPhotos.slice(0, 5));
        }
    }

    // useQuery
    const queryClient = useQueryClient();

    // Submit Logic
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Used when submitting edited review
    const handleUpdate = async () => {
        setIsSubmitting(true);
        
        if (!parsedReview) {
            Alert.alert('Error', 'No review data found to update.');
            setIsSubmitting(false);
            return;
        }

        const updates: UpdateReviewBody = {};
        if (foodRating !== parsedReview.food_rating) updates.food_rating = foodRating;
        if (atmosphereRating !== parsedReview.atmosphere_rating) updates.atmosphere_rating = atmosphereRating;
        if (worthItRating !== parsedReview.worth_it_rating) updates.worth_it_rating = worthItRating;
        if (mealType !== parsedReview.meal_type) updates.meal_type = mealType;
        if (amountSpent !== parsedReview.amount_spent) updates.amount_spent = amountSpent;
        const sortedTags = [...(tags ?? [])].sort();
        const sortedOriginalTags = [...(parsedReview.tags ?? [])].sort();
        if (JSON.stringify(sortedTags) !== JSON.stringify(sortedOriginalTags)) updates.tags = tags;
        if (remarks !== parsedReview.remarks) updates.remarks = remarks;
        if (JSON.stringify(photos) !== JSON.stringify(parsedReview.image_urls ?? [])) updates.image_urls = photos;

        if (Object.keys(updates).length === 0) {
            Alert.alert('No Changes', 'You have not made any changes to the review.');
            setIsSubmitting(false);
            return;
        }

        try {
            await updateReview(parsedReview.id, updates);
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            Alert.alert('Success', 'Your review has been updated!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    // Used when submitting new review
    const handleSubmit = async () => {
        setIsSubmitting(true);
        // 1. Validate Inputs
        if (!parsedLocation) {
            alert('Invalid location data. Please go back and try again.');
            setIsSubmitting(false);
            return;
        }

        const hasSubmissionError =
            foodRating === 0 ||
            atmosphereRating === 0 ||
            worthItRating === 0;

        if (hasSubmissionError) {
            Alert.alert('Missing Fields', 'Please fill in all required fields (Food, Atmosphere, Worth It ratings).');
            setIsSubmitting(false);
            return;
        }

        // 2. Call API to submit review data
        try {
            const reviewData = {
                location: {
                    mapbox_id: parsedLocation.mapbox_id,
                    place_name: parsedLocation.name,
                    address: parsedLocation.address,
                    latitude: parsedLocation.latitude,
                    longitude: parsedLocation.longitude,
                    cuisine_types: parsedLocation.cuisine_types,
                },
                review: {
                    food_rating: foodRating,
                    atmosphere_rating: atmosphereRating,
                    worth_it_rating: worthItRating,
                    meal_type: mealType ?? undefined,
                    amount_spent: amountSpent ?? undefined,
                    tags: tags ?? undefined,
                    remarks: remarks ?? undefined,
                    image_urls: photos 
                }
            }
            await createReview(reviewData);
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            Alert.alert('Success', 'Your review has been submitted!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }
    

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                enableOnAndroid={true}
                extraScrollHeight={24}
            >
                {/* Location */}
                <Text style={styles.locationName}>{parsedLocation?.name}</Text>
                <Text style={styles.locationAddress}>{parsedLocation?.address}</Text>

                {/* Ratings card */}
                <View style={styles.ratingsCard}>
                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>Food</Text>
                        <StarRating
                            rating={foodRating}
                            onChange={setFoodRating}
                            color='#FFB800'
                            starSize={26}
                            maxStars={5}
                            step="full"
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>Atmosphere</Text>
                        <StarRating
                            rating={atmosphereRating}
                            onChange={setAtmosphereRating}
                            color='#FFB800'
                            starSize={26}
                            maxStars={5}
                            step="full"
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>Worth It?</Text>
                        <StarRating
                            rating={worthItRating}
                            onChange={setWorthItRating}
                            color='#FFB800'
                            starSize={26}
                            maxStars={5}
                            step="full"
                        />
                    </View>
                </View>
                
                {/* Photo Container */}
                <View style={styles.photoContainer}>
                    <View style={styles.photoHeader}>
                        <Text style={styles.photoTitle}>Photos</Text>
                        <Text style={styles.photoCount}>{photos.length} selected</Text>
                    </View>
                    {photos.length > 0 ? (
                        <View style={styles.photoRow}>
                            {photos.map((photo, index) => (
                                <View key={`${photo}-${index}`} style={styles.photoWrapper}>
                                    <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
                                    <TouchableOpacity
                                        onPress={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                                        style={styles.photoCloseButton}
                                        hitSlop={8}
                                    >
                                        <Ionicons name="close-circle" size={18} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.photoEmptyState}>
                            <Ionicons name="images-outline" size={18} color="#999" />
                            <Text style={styles.photoEmptyText}>No photos added yet</Text>
                        </View>
                    )}
                </View>
                {/* Add photos */}
                <TouchableOpacity style={styles.addPhotosButton} onPress={pickImage}>
                    <Ionicons name="image-outline" size={20} color="white" />
                    <Text style={styles.addPhotosText}>Add photos</Text>
                </TouchableOpacity>

                {/* Meal time */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Meal Type</Text>
                        <Text style={styles.optionalText}>(optional)</Text>
                    </View>
                    <SingleChipSelector
                        options={MEAL_TYPES}
                        selectedOption={mealType ?? ''}
                        setSelectedOption={(option) => setMealType(option as MealType || null)}
                    />
                </View>

                {/* Amount spent (single select) */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Spendings Per Person (SGD)</Text>
                        <Text style={styles.optionalText}>(optional)</Text>
                    </View>
                    <SingleChipSelector
                        options={AMOUNT_OPTIONS}
                        selectedOption={amountSpent ?? ''}
                        setSelectedOption={(option) => setAmountSpent(option as AmountSpent || null)}
                    />
                </View>

                {/* Additional tags */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Additional Tags</Text>
                        <Text style={styles.optionalText}>(optional)</Text>
                    </View>
                    <MultiChipSelector
                        options={TAG_OPTIONS}
                        selectedOptions={tags ?? []}
                        setSelectedOptions={(opts) => setTags(opts.length > 0 ? opts : null)}
                    />
                </View>

                {/* Remarks */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Remarks</Text>
                        <Text style={styles.optionalText}>(optional)</Text>
                    </View>
                    <TextInput
                        style={styles.remarksInput}
                        value={remarks ?? ''}
                        onChangeText={(text) => setRemarks(text || null)}
                        placeholder="Type Here..."
                        placeholderTextColor="#aaa"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={isEditMode ? handleUpdate : handleSubmit} disabled={isSubmitting}>
                    <Text style={styles.submitText}>{isSubmitting ? 'Submitting...' : isEditMode ? 'Update Review' : 'Submit Review'}</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    backButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 56,
    },
    locationName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111',
        marginBottom: 4,
        lineHeight: 32,
    },
    locationAddress: {
        fontSize: 14,
        color: '#777',
        fontWeight: '400',
        marginBottom: 18,
    },
    ratingsCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        paddingHorizontal: 16,
        marginBottom: 14,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#222',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    addPhotosButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#43a8e6',
        borderRadius: 14,
        paddingVertical: 13,
        marginBottom: 8,
    },
    addPhotosText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    photoContainer: {
        marginBottom: 12,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ececec',
        backgroundColor: '#fafafa',
    },
    photoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    photoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },
    photoCount: {
        fontSize: 12,
        color: '#777',
        fontWeight: '500',
    },
    photoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    photoWrapper: {
        position: 'relative',
        width: 92,
        height: 92,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e6e6e6',
        backgroundColor: '#f6f6f6',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoCloseButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        zIndex: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        borderRadius: 999,
    },
    photoEmptyState: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#d8d8d8',
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
        alignSelf: 'flex-start',
    },
    photoEmptyText: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    optionalText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#777',
        marginLeft: 8,
    },
    remarksInput: {
        marginTop: 10,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#333',
        minHeight: 100,
    },
    submitButton: {
        marginTop: 28,
        backgroundColor: '#43a8e6',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
});
