import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { getReviews } from '../../services/reviews'
import { StarRatingDisplay } from 'react-native-star-rating-widget'
import ReviewCardList from '@/components/ReviewCardList';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

export default function ViewReviews() {
    const { locationId } = useLocalSearchParams<{ locationId?: string }>();

    const { data, error } = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => {
            const response = await getReviews();
            return response.data;
        }
    });
    
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error.message || 'Failed to load reviews. Please try again later.');
        }
    }, [error]);

    const parsedReview = data?.find((loc) => loc.mapbox_id === locationId);

    // Calculate average ratings for Stats section
    const { average_food_rating, average_atmosphere_rating, average_worth_it_rating, average_rating } = useMemo(() => {
        const reviewCount = parsedReview?.reviews.length ?? 0;
        if (reviewCount === 0) return { average_food_rating: 0, average_atmosphere_rating: 0, average_worth_it_rating: 0, average_rating: 0 };
        const average_food_rating = parsedReview!.reviews.reduce((sum, r) => sum + r.food_rating, 0) / reviewCount;
        const average_atmosphere_rating = parsedReview!.reviews.reduce((sum, r) => sum + r.atmosphere_rating, 0) / reviewCount;
        const average_worth_it_rating = parsedReview!.reviews.reduce((sum, r) => sum + r.worth_it_rating, 0) / reviewCount;
        const average_rating = parsedReview!.reviews.reduce((sum, r) => sum + r.food_rating + r.atmosphere_rating + r.worth_it_rating, 0) / (reviewCount * 3);
        return { average_food_rating, average_atmosphere_rating, average_worth_it_rating, average_rating };
    }, [parsedReview?.reviews]);


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView>
            {/* Header */}
            <View>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>
            </View>
            {parsedReview ? (
                <View style={styles.reviewContainer}>
                    <View style={styles.locationHeader}>
                        <Text style={styles.locationName}>{parsedReview.place_name}</Text>
                        <Text style={styles.locationAddress}>{parsedReview.address}</Text>
                        <Text>{parsedReview.cuisine_types?.join(', ')}</Text>
                    </View>
                    <View style={styles.statsCard}>
                        <Text style={styles.statsTitle}>Stats</Text>
                        <View style={styles.overallRating}>
                            <View style={styles.overallRatingItem}>
                                <Text style={styles.overallRatingValue}>{average_rating.toFixed(1)}</Text>
                                <Text style={styles.overallRatingLabel}>Avg Rating</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.overallRatingItem}>
                                <Text style={styles.overallRatingValue}>{parsedReview.reviews.length}</Text>
                                <Text style={styles.overallRatingLabel}>Visits</Text>
                            </View>
                        </View>
                        <View style={styles.avgRatingRow}>
                            <Text style={styles.avgRatingLabel}>Food</Text>
                            <StarRatingDisplay starSize={20} rating={average_food_rating} />
                        </View>
                        <View style={styles.avgRatingRow}>
                            <Text style={styles.avgRatingLabel}>Atmosphere</Text>
                            <StarRatingDisplay starSize={20} rating={average_atmosphere_rating} />
                        </View>
                        <View style={styles.avgRatingRow}>
                            <Text style={styles.avgRatingLabel}>Worth It</Text>
                            <StarRatingDisplay starSize={20} rating={average_worth_it_rating} />
                        </View>
                    </View>

                    <ReviewCardList
                        DATA={parsedReview.reviews}
                        onEdit={(entry) => router.push({
                            pathname: '/add-review',
                            params: {
                                review: JSON.stringify(entry),
                                location: JSON.stringify({
                                    name: parsedReview!.place_name,
                                    address: parsedReview!.address,
                                    mapbox_id: parsedReview!.mapbox_id,
                                    latitude: parsedReview!.latitude,
                                    longitude: parsedReview!.longitude,
                                    cuisine_types: parsedReview!.cuisine_types,
                                })
                            }
                        })}
                    />
                </View>
            ) : (
                <View>
                    <Text>No review available.</Text>
                </View>
            )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ─── Layout ───────────────────────────────────────────────
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    backButton: {
        paddingLeft: 10,
    },
    reviewContainer: {
        padding: 15,
    },

    // ─── Location Header ──────────────────────────────────────
    locationHeader: {
        marginBottom: 10,
    },
    locationName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    locationAddress: {
        fontSize: 14,
        color: '#797979',
    },

    // ─── Stats / Card ────────────────────────────────
    statsCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ececec',
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 14,
        color: '#111',
    },
    overallRating: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingVertical: 14,
        marginBottom: 16,
    },
    overallRatingItem: {
        alignItems: 'center',
    },
    overallRatingValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111',
    },
    overallRatingLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 36,
        backgroundColor: '#e0e0e0',
    },
    avgRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#ececec',
    },
    avgRatingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});
