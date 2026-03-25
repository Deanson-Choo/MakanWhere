import {View, StyleSheet, Alert, TouchableOpacity, Text} from 'react-native';
import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react';
import { Location } from '../../types/location';
import { fetchReviewsByUser } from '@/services/reviews';
import { Ionicons } from '@expo/vector-icons';
import { StarRatingDisplay } from 'react-native-star-rating-widget';
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query';


Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function Map() {
    const [selectedLocation ,setSelectedLocation] = useState<Location | undefined>(undefined)
    const [viewState, setViewState] = useState({
        zoom: 9,
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
                        animationMode={'flyTo'} 
                        animationDuration={1000}                        
                    />
                    {reviews?.map((review) => (
                        <MarkerView key = {review.id} coordinate = {[review.longitude, review.latitude]}>
                            <TouchableOpacity onPress={() => handleSelection(review)}>
                                <Ionicons name="location-sharp" size={30} color={getColor(review.rating!, review.id!)} />
                            </TouchableOpacity>
                        </MarkerView>
                    ))}
                </MapView>
                <SafeAreaView style={styles.safeArea}>
                    {selectedLocation ? (
                        <View style={styles.modal}>
                            <Text style={styles.title}>{selectedLocation.place_name}</Text>
                            <Text style={styles.address}>{selectedLocation.address}</Text>
                            <StarRatingDisplay
                                rating={selectedLocation.rating!}
                                maxStars={5}
                                starSize={20}
                            />
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
});