import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import StarRating, { StarRatingDisplay } from 'react-native-star-rating-widget';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router';
import useLocation from '@/hooks/useLocation';
import SearchBox from '@/components/SearchBox';
import { Location } from '@/types/location';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';

export default function Explore() {
    const { mapbox_id, session_token } = useLocalSearchParams<{ mapbox_id: string; session_token: string;}>();
    const searchResult: Location | null = useLocation(mapbox_id, session_token);

    const [isEditing, setIsEditing] = useState(false);
    const [rating, setRating] = useState(searchResult?.rating || 0);
    const [comment, setComment] = useState(searchResult?.comment || '');
    const [hasReview, setHasReview] = useState(Boolean(searchResult?.rating || searchResult?.comment));

    useEffect(() => {
        if (!searchResult) {
            setRating(0);
            setComment('');
            setHasReview(false);
            setIsEditing(false);
            return;
        }

        setRating(searchResult.rating ?? 0);
        setComment(searchResult.comment ?? '');
        setHasReview(Boolean((searchResult.rating ?? 0) > 0 || (searchResult.comment ?? '').trim().length > 0));
        setIsEditing(false);
    }, [searchResult]);

    const cancelEditing = () => {
        setRating(searchResult?.rating ?? 0);
        setComment(searchResult?.comment ?? '');
        setIsEditing(false);
    }

    const handleSubmit = async () => {
        if (!searchResult) return;

        const endpoint = `${API_BASE_URL}/app/reviews`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: 1,
                    ...searchResult,
                    rating,
                    comment
                })
            });

            if (response.ok) {
                setHasReview(rating > 0 || comment.trim().length > 0);
                setIsEditing(false);
                console.log("Review submitted successfully");
            } else {
                const errorText = await response.text();
                console.error(`Failed to submit review: ${response.status} ${errorText}`);
            }
        } catch (error) {
            console.error(`Network request failed while submitting review to ${endpoint}`, error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Search Box Section */}
            <View style={styles.searchSection}>
                <SearchBox/>
            </View>

            {/* Search Result Section */}
            {searchResult && (
                <View style={styles.resultCard}>
                    <Text style={styles.placeName}>{searchResult.place_name}</Text>
                    <Text style={styles.address}>{searchResult.address}</Text>
                    {hasReview ? (
                        isEditing ? (
                            <View style={styles.reviewCard}>
                                <Text style={styles.sectionTitle}>Your Review</Text>
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
                                <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
                                    <Text style={styles.primaryButtonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                            ) : (
                            <View style={styles.reviewCard}>
                                <Text style={styles.sectionTitle}>Your Review</Text>
                                <StarRatingDisplay rating={rating} starSize={20} maxStars={5} />
                                <Text style={styles.comment}>{comment}</Text>
                                <TouchableOpacity style={styles.primaryButton} onPress={() => setIsEditing(true)}>
                                    <Text style={styles.primaryButtonText}>Edit Review</Text>
                                </TouchableOpacity>
                            </View>
                            )
                    ) : (
                        isEditing ? 
                            (
                            <View style={styles.reviewCard}>
                                <Text style={styles.sectionTitle}>Your Review</Text>
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
                                <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit()}>
                                    <Text style={styles.primaryButtonText}>Submit</Text>
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
    }
});