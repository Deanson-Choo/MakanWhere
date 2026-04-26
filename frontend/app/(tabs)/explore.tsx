import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router';
import SearchBox from '@/components/SearchBox';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocationSearch } from '@/hooks/useLocation';
import { submitReview, ReviewPayload } from '@/services/reviews';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';

import * as ImagePicker from "expo-image-picker";

export default function Explore() {
    const { mapbox_id, session_token } = useLocalSearchParams<{ mapbox_id: string; session_token: string;}>(); // Came from SearchBox component
    const { selectedLocation, getDetails, clearSelectedLocation } = useLocationSearch();

    const [isEditing, setIsEditing] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hasReview, setHasReview] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const queryClient = useQueryClient();

    // Updates selectedLocation
    useEffect(() => {
        if (mapbox_id && session_token) {
            getDetails(mapbox_id, session_token);
        }
    }, [mapbox_id, session_token, getDetails]);

    useEffect(() => {
        if (!selectedLocation) {
            setRating(0);
            setComment('');
            setHasReview(false);
            setIsEditing(false);
            return;
        }

        setHasReview(Boolean((selectedLocation.rating ?? 0) > 0 || (selectedLocation.comment ?? '').trim().length > 0));
        setIsEditing(false);
    }, [selectedLocation]);

    const cancelEditing = () => {
        setRating(0);
        setComment('');
        setIsEditing(false);
    }

    const handleRedirect = (id: number) => {
        router.push( {pathname: "/" , params: { highlightId: id } });
    }

    const handleSubmit = async () => {
        if (!selectedLocation) return;
        
        const payload: ReviewPayload = {
            mapbox_id: selectedLocation.mapbox_id,
            rating,
            comment,
            place_name: selectedLocation.place_name,
            address: selectedLocation.address,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            image: image ?? undefined,
        };

        setIsLoading(true);
        try {
            await submitReview(payload);
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            setHasReview(true);
            setIsEditing(false);
            setRating(0);
            setComment('');
            setImage(null);
            clearSelectedLocation();
        } finally {
            setIsLoading(false);
        }
    };

    const ensureImagePermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to access media library is required!');
            return false;
        }
        return true;
    }

    const pickImage = async () => {
        const hasPermission = await ensureImagePermission();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.3,
            base64: true
        });

        if (result.canceled || !result.assets?.length) return;

        const asset = result.assets[0];
        const mimeType = asset.mimeType ?? 'image/jpeg';
        const base64Uri = `data:${mimeType};base64,${asset.base64}`;
        setImage(base64Uri);
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 12, textAlign: 'center' }}>Find or Review Food Places</Text>
            {/* Search Box Section */}
            <View style={styles.searchSection}>
                <SearchBox/>
            </View>

            {/* Search Result Section */}
            {selectedLocation && (
                <View style={styles.resultCard}>
                    <Text style={styles.placeName}>{selectedLocation.place_name}</Text>
                    <Text style={styles.address}>{selectedLocation.address}</Text>
                    {hasReview ? (
                        <View>
                            <TouchableOpacity style={styles.primaryButton} onPress = {() => handleRedirect(selectedLocation.id!)}>
                                <Text style={styles.primaryButtonText}>See Your Review In Home Page</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        isEditing ? 
                            (
                            <View style={styles.reviewCard}>
                                <Text style={styles.sectionTitle}>Your Review</Text>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Image</Text>
                                    <View style={styles.imagePickerBox}>
                                    {image ? (
                                        <Image source={{ uri: image }} style={styles.previewImage} />
                                    ) : (
                                        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                                        <Ionicons name="image-outline" size={28} color="#64748B" />
                                        <Text style={styles.imagePickerText}>Select an image</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                </View>
                                <Ionicons name="close-outline" size={24} style={styles.closeIcon} onPress={cancelEditing} />
                                <StarRating rating={rating} starSize={20} maxStars={5} onChange={setRating} />
                                <TextInput
                                    style={styles.commentBox}
                                    value={comment}
                                    onChangeText={setComment}
                                    placeholder="Share your thoughts..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                />
                                <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()} disabled={isLoading}>
                                    <Text style={styles.primaryButtonText}>{isLoading ? 'Submitting...' : 'Submit'}</Text>
                                </TouchableOpacity>
                            </View> 
                            ) : (
                            <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditing(true)}>
                                <Text style={styles.primaryButtonText}>Add A Review</Text>
                            </TouchableOpacity>
                            )
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    searchSection: {
        marginBottom: 12,
    },
    resultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        gap: 8,
    },
    placeName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    address: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 8,
    },
    reviewCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    rating: {
        fontSize: 16,
        fontWeight: '700',
        color: '#007AFF',
    },
    comment: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    primaryButton: {
        marginTop: 4,
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    submitButton: {
        marginTop: 4,
        backgroundColor: '#34C759',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    commentBox: {
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        minHeight: 96,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111827',
        lineHeight: 20,
    },
    closeIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        color: '#020202',
    },
    imagePickerBox: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    height: 180,
    backgroundColor: '#E2E8F0'
  },
  imagePickerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  imagePickerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569'
  },
  previewImage: {
    width: '100%',
    height: '100%'
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8
  },
});