import {View, StyleSheet, TouchableOpacity, Text, Image as RNImage} from 'react-native';
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react';
import { Location } from '../../types/location';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import SearchBox from '@/components/SearchBox';
import { Colors } from "@/constants/colors";
import { router } from 'expo-router';


Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!);

export default function Map() {
    // Map Settings
    const [viewState, setViewState] = useState({
        zoom: 11,
        longitude: 103.8,
        latitude: 1.38
    })

    // Selected Location
    const [selectedLocation ,setSelectedLocation] = useState<Location | undefined>(undefined)
    useEffect(() => {
        if (selectedLocation) {
            setViewState({
                zoom: 13,
                longitude: selectedLocation.longitude,
                latitude: selectedLocation.latitude - 0.015
            });
        }
    }, [selectedLocation]);

    // Search Box Focus State
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    
    return (
        <View style={styles.container}>
            {/* Search Box Logic */}
            {isSearchFocused && <View style={styles.overlay} />}
            <SafeAreaView style={styles.safeArea}>
                <SearchBox onFocusChange={setIsSearchFocused} setSelectedLocation={setSelectedLocation} />
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
                {selectedLocation && (
                    <PointAnnotation
                        id={String(selectedLocation.id)}
                        coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
                    >
                        <RNImage 
                            source={require('@/assets/images/Logo_Plain.png')}
                            style={styles.selectedLocationMarker}
                            resizeMode="contain"
                        />
                    </PointAnnotation>
                )}
            </MapView>

            {/* Selected Location Display */}
            <View style={styles.safeAreaModal}>
                {selectedLocation ? (
                    <View style={styles.modal}>
                        <Ionicons name="close" size={24} style={styles.closeIcon} onPress={() => setSelectedLocation(undefined)} />
                        <View style={styles.grabber}/>
                        <View style={styles.placeInfoContainer}>
                            <View style={styles.placeInfoHeader}>
                                <Text style={styles.title}>{selectedLocation.place_name}</Text>
                                <View style={styles.ratingsContainer}>
                                    <Ionicons name="star" size={16} color='gold'/>
                                    <Text style={styles.ratingsText}>{selectedLocation.rating ?? 'N/A'}</Text>
                                </View>
                            </View>
                            <Text style={styles.address}>{selectedLocation.address}</Text>
                        </View>
                        <View style={styles.imageContainer}>
                            <Image 
                                source={{uri: 'https://sethlui.com/wp-content/uploads/2023/08/springleaf-prata-17.jpg'}}
                                style={styles.image}
                                contentFit={'cover'}
                            />
                        </View>
                        {selectedLocation.rating? (
                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.buttonText}>See Reviews</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.button} onPress={()=> router.push({
                                pathname: '/add-review',
                                params: {
                                    mapbox_id: selectedLocation.mapbox_id,
                                }
                            })
                            }>
                                <Text style={styles.buttonText}>Add A Review</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    null
                )}
            </View>
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

    selectedLocationMarker: {
        width: 45,
        height: 57,
    },

    safeAreaModal: {
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderColor: '#cbcbcb',
        borderWidth: 1,
    },
    grabber: {
        width: 40,
        height: 5,
        backgroundColor: '#aeacac',
        borderRadius: 2.5,
        alignSelf: 'center', 
        position: 'absolute',
        top: 10,
    },
    closeIcon: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    placeInfoContainer: {
        gap: 5,
        marginBottom: 15,
        marginTop: 25
    },
    placeInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 36
    },
    ratingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 15,
        borderColor: Colors.primary,
        borderWidth: 2,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    ratingsText: {
        fontWeight: '600',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        width: '70%'
    },
    address: {
        fontSize: 16,
        fontWeight: '300',
    },
    imageContainer: {
        borderRadius: 20,
        borderColor: '#cbcbcb',
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 15
    },
    image: {
        width: '100%',
        height: 200,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingVertical: 8,
        borderRadius: 15,
        alignItems: 'center',
        borderColor: '#c5c5c5',
        borderWidth: 1,
    },
    buttonText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 16,
    },
});