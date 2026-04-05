import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react';
import { Location } from '../../types/location';
import { fetchReviewsByUser } from '@/services/reviews';
import { Ionicons } from '@expo/vector-icons';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';


Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function Map() {
    const { highlightId } = useLocalSearchParams<{ highlightId: string }>();
    const [selectedLocation ,setSelectedLocation] = useState<Location | undefined>(undefined)
    const [viewState, setViewState] = useState({
        zoom: 11,
        longitude: 103.8,
        latitude: 1.38
    })

    // Load Reviews
    const { data: reviews, isLoading } = useQuery({
        queryKey: ['reviews'],
        queryFn: () => fetchReviewsByUser('createdAt', 'desc')
    })

    const handleSelection = (review: Location) => {
        setViewState({
            zoom: 12,
            longitude: review.longitude,
            latitude: review.latitude
        })
        setSelectedLocation(review)
    }

    const handleRedirect = (id: number) => {
        router.push( {pathname: "/" , params: { highlightId: id } });
    }

    const getColor = (rating: number, locationId: number) => {
        if (selectedLocation && locationId === selectedLocation.id) {
            if (rating >= 4) return '#00ff0d';
            if (rating >= 2) return '#ff9900';
            return '#ff0d00';
        }
        
        if (rating >= 4) return '#53ca59';
        if (rating >= 2) return '#d19e51';
        return '#d8564f';
    }

    // Handle highlight from Home page
    useEffect(() => {
        if (highlightId && reviews && reviews.length > 0) {
            const review = reviews.find(r => r.id === parseInt(highlightId));

            if (review) {
                setTimeout(() => {
                    handleSelection(review);
                }, 100);
            }
        }
     }, [highlightId, reviews]);
    
    return (
        <View style={styles.page}>
            <View style={styles.container}>
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
                    {reviews?.map((review) => (
                        <PointAnnotation
                            key={`${review.id}-${selectedLocation?.id === review.id ? 'selected' : 'default'}`} // Remount when selected to trigger animation
                            id={String(review.id)}
                            coordinate={[review.longitude, review.latitude]}
                            onSelected={() => handleSelection(review)}
                        >
                            <View>
                                <Ionicons name="location-sharp" size={30} color={getColor(review.rating!, review.id!)} />
                            </View>
                        </PointAnnotation>
                    ))}
                </MapView>
                <SafeAreaView style={styles.safeArea}>
                    {selectedLocation ? (
                        <View style={styles.modal}>
                            <Text style={styles.title}>{selectedLocation.place_name}</Text>
                            <Text style={styles.address}>{selectedLocation.address}</Text>
                            {selectedLocation.image_url && <Image source={{ uri: selectedLocation.image_url }} style={{ width: '100%', height: 150, borderRadius: 10, marginVertical: 8 }} contentFit="cover" />}
                            <StarRatingDisplay rating={selectedLocation.rating!} starSize={20} maxStars={5}/>
                            <Text style={styles.comment}>{selectedLocation.comment}</Text>
                            <Ionicons name="close" size={24} style={styles.closeIcon} onPress={() => setSelectedLocation(undefined)} />
                            <TouchableOpacity style={styles.primaryButton} onPress={() => handleRedirect(selectedLocation.id!)}>
                                <Text style={styles.primaryButtonText}>See Your Review In Home Page</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        null
                    )}
                </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { height: '100%', width: '100%' },
    map: { flex: 1 },
    safeArea: { position: 'absolute', bottom: 0, width: '100%', zIndex: 50 },
    modal: { 
        backgroundColor: 'white',
        marginHorizontal: 20,               
        padding: 20,           
        borderRadius: 20,         
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    comment: {
        fontSize: 15,
        marginTop: 10,
        fontStyle: 'italic',
        color: '#333',
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    primaryButton: {
        marginTop: 5,
        backgroundColor: '#007AFF',
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
    displayCommentBox: {
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        fontSize: 14,
        color: '#111827',
        textAlignVertical: 'top',
        padding: 8,
        marginTop: 8,
    }
});