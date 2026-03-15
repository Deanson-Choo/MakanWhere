import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";  
import { API_BASE_URL } from "@/constants/api";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "@/services/auth";

type UserReview = {
    id: number;
    rating: number;
    comment: string;
    location: {
        mapbox_id: string;
        place_name: string;
        address: string;
    };
};

export default function Profile() {
    const [reviews, setReviews] = useState<UserReview[]>([]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/app/reviews/1`); // Replace '1' with actual user ID
            if (res.ok) {
                const data = await res.json();
                setReviews(data.data);
            } 
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.pageTitle}>Your Reviews</Text>

                {reviews.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>No reviews yet</Text>
                        <Text style={styles.emptyText}>Your submitted reviews will appear here.</Text>
                    </View>
                ) : (
                    reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.headerRow}>
                                <Text style={styles.placeName}>{review.location.place_name}</Text>
                                <View style={styles.ratingBadge}>
                                    <Text style={styles.ratingText}>{review.rating.toFixed(1)} ★</Text>
                                </View>
                            </View>

                            <Text style={styles.address}>{review.location.address}</Text>

                            <Text style={styles.comment}>
                                {review.comment?.trim() ? review.comment : "No comment provided."}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>
            <TouchableOpacity onPress={logout}>
                <Text>Log Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    contentContainer: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 2,
    },
    reviewCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 14,
        gap: 8,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },
    placeName: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    ratingBadge: {
        backgroundColor: "#EFF6FF",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    ratingText: {
        color: "#1D4ED8",
        fontSize: 13,
        fontWeight: "700",
    },
    address: {
        fontSize: 14,
        color: "#6B7280",
    },
    comment: {
        fontSize: 15,
        lineHeight: 21,
        color: "#374151",
    },
    emptyCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 16,
        gap: 4,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    emptyText: {
        fontSize: 14,
        color: "#6B7280",
    },
});