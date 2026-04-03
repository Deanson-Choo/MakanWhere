import { Text, StyleSheet, TouchableOpacity, View } from "react-native";  
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "@/services/auth";
import useAuthStore from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchReviewsByUser } from "@/services/reviews";
import { Image } from 'expo-image'

export default function Profile() {
    const { user } = useAuthStore();

    const { data } = useQuery({
        queryKey: ['reviews', 'createdAt', true],
        queryFn: () => fetchReviewsByUser('createdAt', 'desc'),
    }) 

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{ alignItems: "center", marginTop: 32 }}>
                <View style={{borderRadius: 50, overflow: "hidden", borderColor: "#d6e1f3", borderWidth: 2}}>
                    <Image 
                    source={{ uri: `https://api.dicebear.com/9.x/personas/svg?seed=${user?.id}` }}
                    style={{ width: 100, height: 100 }} 
                    contentFit ="cover"
                    />
                </View>

                <Text style={styles.welcomeText}>{user?.username}</Text>
                <Text style={styles.reviewCount}>Reviews: {data?.length ?? 0}</Text>

                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        position: "relative"
    },
    logoutButton: {
        backgroundColor: "#EF4444",
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
        margin: 14,
        width: "90%",
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