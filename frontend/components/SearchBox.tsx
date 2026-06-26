import 'react-native-get-random-values'
import {useState, useEffect, useRef} from "react";
import { v4 as uuidv4 } from "uuid";
import { Alert, FlatList, TextInput, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Location, Suggestion, fetchSuggestions, fetchLocationDetails } from '../services/mapbox';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

type SearchBoxProps = {
    setIsSearchFocused: (isFocused: boolean) => void;
    setSelectedLocation: (location: Location | null) => void;
}

export default function SearchBox({setIsSearchFocused, setSelectedLocation}: SearchBoxProps) {
    // Search Bar Focus State (To toggle between map and search results)
    const [focused, setFocused] = useState(false)
    const inputRef = useRef<TextInput>(null);

    const handleFocus = () => {
        setFocused(true);
        setIsSearchFocused(true);
    }

    const handleBack = () => {
        setFocused(false);
        setIsSearchFocused(false);
        inputRef.current?.blur(); // Dismiss keyboard and blur input

        setQuery('');
        setSelectedLocation(null);
        setSuggestions([]);
    }

    // Search Logic
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const sessionTokenRef = useRef(uuidv4());
    const isSelectingRef = useRef(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    // This updates 'debouncedQuery' 300ms after 'query' stops changing.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        //If user types again before 300ms, cancel the previous timer
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        (async () => {
            if (debouncedQuery.trim()) {
                // Fetch suggestions
                try {
                    const response = await fetchSuggestions(debouncedQuery, sessionTokenRef.current);
                    setSuggestions(response.data);
                } catch (error: any) {
                    Alert.alert('Search Error', error.message || 'Failed to fetch suggestions. Please try again.');
                }
            } else {
                // Clear suggestions
                setSuggestions([]);
            }
        })();
    }, [debouncedQuery]);


    // When user selects a suggestion, we want to:
    // 1. Search the Mapbox ID to get the full location details (including lat/lng)
    // 2. If successful, clear the search box and suggestions, and pass the location details to the parent component (Map screen) to update the map view.
    const handleSelection = async (mapboxId: string) => {
        if (isSelectingRef.current) return;
        isSelectingRef.current = true;
        try {
            const response = await fetchLocationDetails(mapboxId, sessionTokenRef.current);
            setSelectedLocation(response.data);
            setQuery('');
            setSuggestions([]);

            sessionTokenRef.current = uuidv4(); // Generate a new token for the next search session

            setFocused(false);
            setIsSearchFocused(false);
            inputRef.current?.blur(); // Dismiss keyboard and blur input
        } catch (error: any) {
            Alert.alert('Location Details Error', error.message || 'Failed to fetch location details. Please try again.');
        } finally {
            isSelectingRef.current = false;
        }
    }

    return (
        <View>
            {/* Search Bar */}
            <View style={styles.container}>
                {focused ? (
                    <TouchableOpacity onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                ) : (
                <Image 
                    source={require('@/assets/images/Logo_Initials.png')}
                    style={styles.logo}
                    contentFit="contain"
                />
                )}
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Search For Food Places"
                    value={query}
                    onChangeText={setQuery}
                    placeholderTextColor="#9CA3AF"
                    onFocus={handleFocus}
                />
                {focused && (
                    <Ionicons name="close" size={20} color="black" onPress={() => setQuery('')} />
                )}
            </View>
            {/* Suggestions List */}
            {suggestions.length > 0 && (
            <FlatList
                data={suggestions}
                keyExtractor={(item: Suggestion) => item.mapbox_id}
                style={styles.suggestionsContainer}
                keyboardShouldPersistTaps="handled"

                ItemSeparatorComponent={() => <View style={{ marginVertical: 10,borderColor: '#cbcbcb', borderWidth: 1 }} />}

                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelection(item.mapbox_id)}>
                        <Ionicons name="search" size={24} color="black" />
                        <View>
                            <Text style={styles.suggestionName}>{item.name}</Text>
                            <Text style={styles.suggestionAddress}>{item.address}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />)}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 25,
        paddingHorizontal: 15,
        paddingVertical: 3,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        borderColor: '#cbcbcb',
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    logo: {
        width: 30,
        height: 37
    },

    suggestionsContainer: {
        marginVertical: 25,
        paddingHorizontal: 25,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    suggestionName: {
        fontSize: 16,
        fontWeight: '500',
    },
    suggestionAddress: {
        fontSize: 13,
        fontWeight: '300',
    }

});