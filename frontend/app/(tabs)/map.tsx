import {View, StyleSheet, Alert, TouchableOpacity, Text} from 'react-native';
import Mapbox, { MapView, Camera, MarkerView } from "@rnmapbox/maps";
import { SafeAreaView } from 'react-native-safe-area-context'
import SearchBox from '../../components/SearchBox';
import {useLocalSearchParams} from 'expo-router';
import { useState, useEffect } from 'react';
import { Location } from '../../types/location';
import { API_BASE_URL } from '../../constants/api';
import useLocation from '@/hooks/useLocation';
import { Ionicons } from '@expo/vector-icons';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function Map() {
    const { mapbox_id, session_token } = useLocalSearchParams<{ mapbox_id: string; session_token: string;}>();
    const searchResult: Location | null = useLocation(mapbox_id, session_token);

    const [viewState, setViewState] = useState({
        zoom: 11,
        longitude: 103.8,
        latitude: 1.38
    })
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    useEffect(() => {
        if (searchResult) {
            setSelectedLocation(searchResult);
        }
    }, [searchResult]);

    useEffect(() => {
        if (!selectedLocation) return;
        setViewState({
            zoom: 12,
            longitude: selectedLocation.longitude,
            latitude: selectedLocation.latitude
        })
    }, [selectedLocation])

    return (
        <View style={styles.page}>
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <SearchBox/>
                </SafeAreaView>
                <MapView style={styles.map}>
                    <Camera
                        defaultSettings={{
                            centerCoordinate: [viewState.longitude, viewState.latitude],
                            zoomLevel: viewState.zoom,
                        }}
                    />
                    {selectedLocation && (
                        <MarkerView coordinate = {[selectedLocation.longitude, selectedLocation.latitude]}>
                            <Ionicons name="location-sharp" size={30} color="red" />
                        </MarkerView>
                    )}
                </MapView>
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { height: '100%', width: '100%' },
    map: { flex: 1 },
    safeArea: { position: 'absolute', top: 0, width: '100%', zIndex: 50 },
});