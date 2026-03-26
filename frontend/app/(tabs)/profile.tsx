import { Text, StyleSheet, TouchableOpacity, View } from "react-native";  
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "@/services/auth";
import useAuthStore from "@/store/authStore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchReviewsByUser } from "@/services/reviews";

export default function Profile() {
    const { user } = useAuthStore();

    const { data } = useQuery({
        queryKey: ['reviews', 'createdAt', true],
        queryFn: () => fetchReviewsByUser('createdAt', 'desc'),
    }) 

    return (
        <SafeAreaView style={styles.safeArea}>
            <View>
                <Text style={styles.welcomeText}>Welcome {user?.username}</Text>
                <Text style={styles.reviewCount}>Reviews: {data?.length ?? 0}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    logoutButton: {
        backgroundColor: "#EF4444",
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
        margin: 14,
    },
    logoutButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        margin: 14,
    },
    reviewCount: {
        fontSize: 16,
        color: "#6B7280",
        marginHorizontal: 14,
    },
});