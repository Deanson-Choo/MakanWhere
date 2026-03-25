import { StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router';
import SearchBox from '@/components/SearchBox';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocationSearch } from '@/hooks/useLocation';
import { submitReview } from '@/services/reviews';
import { useQueryClient } from '@tanstack/react-query';

export default function Explore() {
    const { mapbox_id, session_token } = useLocalSearchParams<{ mapbox_id: string; session_token: string;}>(); // Came from SearchBox component
    const { selectedLocation, getDetails, clearSelectedLocation } = useLocationSearch();

    const [isEditing, setIsEditing] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hasReview, setHasReview] = useState(false);

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
        
        const payload = {
            mapbox_id: selectedLocation.mapbox_id,
            rating,
            comment,
            place_name: selectedLocation.place_name,
            address: selectedLocation.address,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
        };

        await submitReview(payload);
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        setHasReview(true);
        setIsEditing(false);
        setRating(0);
        setComment('');
        clearSelectedLocation();
    };

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