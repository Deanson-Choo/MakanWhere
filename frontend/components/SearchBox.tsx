import 'react-native-get-random-values'
import {useState, useEffect, useRef} from "react";
import { v4 as uuidv4 } from "uuid";
import { FlatList, TextInput, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from "react-native";
import { Suggestion } from "../types/suggestion";
import { router } from 'expo-router';
import { useLocationSearch } from '@/hooks/useLocation';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Location } from '@/types/location';

type SearchBoxProps = {
    onFocusChange: (isFocused: boolean) => void;
    setSelectedLocation: (location: Location | undefined) => void;
}

export default function SearchBox({onFocusChange, setSelectedLocation}: SearchBoxProps) {
    // Search Bar Focus State
    const [focused, setFocused] = useState(false)
    const inputRef = useRef<TextInput>(null);

    const handleFocus = () => {
        setFocused(true);
        onFocusChange?.(true);
    }

    const handleBack = () => {
        setFocused(false);
        onFocusChange?.(false);
        inputRef.current?.blur();
        setQuery('');
    }

    // Search Logic
    const { suggestions, search, isLoading, getDetails } = useLocationSearch();
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [sessionToken] = useState(() => uuidv4());

    // This updates 'debouncedQuery' 300ms after 'query' stops changing.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        //If user types again before 300ms, cancel the previous timer
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (debouncedQuery.trim()) {
            search(debouncedQuery, sessionToken);
        } else {
            search('', sessionToken); // Clear suggestions when query is empty
        }
    }, [search, debouncedQuery, sessionToken])

    const handleSelection = async (mapboxId: string) => {
        const location = await getDetails(mapboxId, sessionToken);
        if (location) {
            setSelectedLocation(location);
            handleBack();
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
                    source={require('@/assets/images/Logo_Plain.png')}
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
        fontSize: 16,
        fontWeight: '300',
    }

});