import { useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import TopLogo from "@/components/TopLogo";

export default function AddReview() {
    const { mapbox_id } = useLocalSearchParams();

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <TopLogo />
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
})