import 'react-native-get-random-values'
import {useState, useEffect} from "react";
import { v4 as uuidv4 } from "uuid";
import { FlatList, TextInput, View, Text, TouchableOpacity, StyleSheet} from "react-native";
import { Suggestion } from "../types/suggestion";
import { router } from 'expo-router';
import { useLocationSearch } from '@/hooks/useLocation';

export default function SearchBox() {
    const { suggestions, search } = useLocationSearch();
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

    const handleSearch = (mapbox_id: string) => {
        router.push({ pathname: "/explore", params: { mapbox_id: mapbox_id , session_token: sessionToken } });
        setQuery('')
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Input The Restaurant's Name"
                value={query}
                onChangeText={setQuery}
                placeholderTextColor="#9CA3AF"
            />
            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item: Suggestion) => item.mapbox_id}
                    style={styles.suggestionsList}

                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}

                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.suggestionItem} onPress = {() => {handleSearch(item.mapbox_id)}}>
                            <Text style={styles.suggestionName}>{item.name}</Text>
                            <Text style={styles.suggestionAddress}>{item.address}</Text>
                        </TouchableOpacity>
                    )}
                />
                )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: 10
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        fontSize: 20,
        width: '100%',
        padding: 8,
    },
    suggestionsList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        maxHeight: 240,
    },
    suggestionItem: {
        flexDirection: 'column',
        paddingHorizontal: 16,
    },
    suggestionName: {
        fontWeight: '700',
    },
    suggestionAddress: {
        color: '#6B7280',
    },
});