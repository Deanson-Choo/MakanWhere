import {View, StyleSheet, TouchableOpacity, Text, FlatList, Alert, ActivityIndicator} from 'react-native';
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";
import { SafeAreaView } from 'react-native-safe-area-context'
import { Location } from '../../services/mapbox';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import SearchBox from '@/components/SearchBox';
import { router } from 'expo-router';
import { getReviews } from '../../services/reviews';
import MapPin from '@/components/MapPin';
import { useQuery } from '@tanstack/react-query';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function Home() {
    // Default Map Settings
    const [viewState, setViewState] = useState({
        zoom: 11,
        longitude: 103.8,
        latitude: 1.38
    })

    // Search Box Focus State (To toggle between map and search results)
    const [isSearchFocused, setIsSearchFocused] = useState(false);


    // Selected Location State
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [avgRating, setAvgRating] = useState<number | null>(null);

    useEffect(() => {
        if (selectedLocation) {
            setViewState({
                zoom: 13,
                longitude: selectedLocation.longitude,
                latitude: selectedLocation.latitude
            });
        }
     }, [selectedLocation])

    // View toggle state
    const [isListView, setIsListView] = useState(false);

    // Reviews of all locations
    const { data: reviews = [], isLoading, error } = useQuery({
        queryKey: ['reviews'],
        queryFn: async () => {
            const response = await getReviews();
            return response.data;
        }
        
    });

    useEffect(() => {
        if (!selectedLocation) {
            setAvgRating(null);
            return;
        }

        const selectedReview = reviews.find((review) => review.mapbox_id === selectedLocation.mapbox_id);
        if (!selectedReview || !selectedReview.reviews?.length) {
            setAvgRating(null);
            return;
        }

        const average = selectedReview.reviews.reduce((sum, review) => sum + review.food_rating + review.atmosphere_rating + review.worth_it_rating, 0) / (selectedReview.reviews.length * 3);
        setAvgRating(average);
    }, [selectedLocation, reviews]);

   useEffect(() => {
        if (error) {
            Alert.alert('Error', error.message || 'Failed to load reviews. Please try again later.');
        }
    }, [error]);

    if (isListView) {
        return (
            // List View Container
            <View style={styles.container}>
                <SafeAreaView style={styles.listSafeArea}>
                    <View style={styles.listHeader}>
                        <TouchableOpacity style={styles.listBackButton} onPress={() => setIsListView(false)}>
                            <Ionicons name="arrow-back" size={22} color="gray" />
                            <Text style={styles.listBackText}>Map View</Text>
                        </TouchableOpacity>
                        <Text style={styles.listTitle}>All Reviewed Locations</Text>
                    </View>
                    {isLoading ? (
                        <View style={styles.loadingIndicator}>
                            <ActivityIndicator size="large" color='#006aff' />
                        </View>
                    ) : (
                        <FlatList
                            data={reviews}
                            keyExtractor={(item) => item.mapbox_id}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={styles.listItemSeparator} />}
                            renderItem={({ item }) => (
                                <View style={styles.locationCard}>
                                    <Text style={styles.locationName}>{item.place_name}</Text>
                                    <Text style={styles.locationAddress}>{item.address}</Text>
                                    {!!item.cuisine_types?.length && (
                                        <Text style={styles.cuisineText}>{item.cuisine_types.join(', ')}</Text>
                                    )}
                                    <TouchableOpacity
                                        style={styles.viewReviewsButton}
                                        onPress={() => router.push({ pathname: '/view-reviews', params: { locationId: item.mapbox_id } })}
                                    >
                                        <Text style={styles.viewReviewsText}>View All Reviews</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />)}
                </SafeAreaView>
            </View>
        );
    }

    return (
        // Map View Container
        <View style={styles.container}>
            {/* Search Box Logic */}
            {isSearchFocused && <View style={styles.overlay} />}
            <SafeAreaView style={styles.safeArea}>
                <SearchBox setIsSearchFocused={setIsSearchFocused} setSelectedLocation={setSelectedLocation}/>
                {!isSearchFocused && (
                    <TouchableOpacity style={styles.toggleFab} onPress={() => setIsListView(true)}>
                        <Ionicons name="list" size={22} color="white" />
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            {/* Map Display */}
            <MapView style={styles.map}>
                <Camera
                    defaultSettings={{
                        centerCoordinate: [viewState.longitude, viewState.latitude],
                        zoomLevel: viewState.zoom,
                    }}
                    centerCoordinate={[viewState.longitude, viewState.latitude]}
                    zoomLevel={viewState.zoom}
                    animationMode={'flyTo'} 
                    animationDuration={1000}                        
                />

                {/* Selected Location Pin (From Search) */}
                {selectedLocation && !reviews.some(r => r.mapbox_id === selectedLocation.mapbox_id) && (
                    <PointAnnotation
                        id={`search-${selectedLocation.mapbox_id}`}
                        coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
                    >
                        <Ionicons name="location-sharp" size={50} color="#2e83ec" />
                    </PointAnnotation>
                )}

                {/* Pins for all reviewed locations */}
                {!isLoading && reviews.map((review) => {
                    const isSelected = selectedLocation?.mapbox_id === review.mapbox_id;
                    return (
                    <PointAnnotation
                        key={`${review.mapbox_id}-${isSelected}`}
                        id={String(review.mapbox_id)}
                        coordinate={[review.longitude, review.latitude]}
                        onSelected={() => {
                            setSelectedLocation({
                                mapbox_id: review.mapbox_id,
                                name: review.place_name,
                                address: review.address,
                                longitude: review.longitude,
                                latitude: review.latitude,
                                cuisine_types: review.cuisine_types || [],
                            });
                        }}
                    >
                        <MapPin size={isSelected ? 50 : 40} reviews={review.reviews} />
                    </PointAnnotation>
                    );
                })}
            </MapView>

            {/* Location Details Modal */}
            {selectedLocation && (
                <SafeAreaView style={styles.safeAreaModal}>
                    <View style={styles.modal}>
                        <TouchableOpacity style={styles.closeIcon} onPress={() => setSelectedLocation(null)}>
                            <Ionicons name="close" size={20} color="#1f1f1f" />
                        </TouchableOpacity>
                        <View style={styles.placeInfoContainer}>
                            <View style={styles.titleRow}>
                                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{selectedLocation.name}</Text>
                                {avgRating !== null && (
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="#FFB800" />
                                        <Text style={styles.ratingBadgeText}>{avgRating.toFixed(1)}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.address} numberOfLines={2} ellipsizeMode="tail">{selectedLocation.address}</Text>
                            {selectedLocation.cuisine_types && selectedLocation.cuisine_types.length > 0 && (
                                <View style={styles.cuisineRow}>
                                    {selectedLocation.cuisine_types.map((cuisine, index) => (
                                        <View key={index} style={styles.cuisineTag}>
                                            <Text style={styles.cuisineTagText}>{cuisine}</Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedLocation(null);
                                router.push({
                                    pathname: '/add-review',
                                    params: { location: JSON.stringify(selectedLocation) },
                                });
                            }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>Add Review</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        flex: 1
    },
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 1,
    },
    toggleFab: {
        alignSelf: 'flex-end',
        marginTop: 10,
        marginRight: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#50a5ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    safeAreaModal: {
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    modal: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 35,
        paddingBottom: 18,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderColor: '#e5e5e5',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
    },
    closeIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f3f3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeInfoContainer: {
        marginBottom: 14,
        marginTop: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 21,
        fontWeight: '700',
        flex: 1,
        minWidth: 0,
        color: '#111',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
        backgroundColor: '#fff3cd',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ratingBadgeText: {
        color: '#8a5a00',
        fontSize: 12,
        fontWeight: '700',
    },
    address: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: '#555',
    },
    cuisineRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 7,
        marginTop: 8,
    },
    cuisineTag: {
        backgroundColor: '#fff5ec',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffd5ad',
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    cuisineTagText: {
        color: '#7a4a1e',
        fontSize: 12,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#4395ee',
        paddingVertical: 11,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 6,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },

    listSafeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    listHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ececec',
        backgroundColor: '#fff',
    },
    listTitle: {
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    listBackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingVertical: 6,
    },
    listBackText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#797979',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 28,
    },
    listItemSeparator: {
        height: 12,
    },
    locationCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ebebeb',
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
        elevation: 2,
    },
    locationName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#141414',
        marginBottom: 4,
    },
    locationAddress: {
        fontSize: 14,
        color: '#606060',
        marginBottom: 8,
    },
    cuisineText: {
        fontSize: 13,
        color: '#7a4a1e',
        marginBottom: 12,
    },
    viewReviewsButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#4395ee',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    viewReviewsText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});