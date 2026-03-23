import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from "react-native";  
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchReviewsByUser, updateReview, deleteReview } from "@/services/reviews";
import StarRating, { StarRatingDisplay } from "react-native-star-rating-widget";
import { Location } from "@/types/location";
import { useEffect, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';


{/* This is the Home screen that shows all reviews by the user. RUD operations are possible here. */}

export default function Home() {
    const { highlightId } = useLocalSearchParams<{ highlightId: string }>();
    const [reviews, setReviews] = useState<Location[] | undefined>(undefined);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('')
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const loadReviews = async () => {
            const data = await fetchReviewsByUser();
            setReviews(data);
        };
        loadReviews();
    }, []);

    // This effect highlights a review from explore.tsx
    useEffect(() => {
    if (highlightId && reviews && reviews.length > 0) {
        const index = reviews.findIndex(r => r.id === parseInt(highlightId));
        
        if (index !== -1) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: index,
                    animated: true,
                    viewPosition: 0.5 // 0.5 puts the item exactly in the middle of the screen
                });
            }, 100);
        }
    }
}, [highlightId, reviews]);

    const handleDelete = async (id: number) => {
        await deleteReview(id);
        setReviews(reviews?.filter(review => review.id !== id));
    }

    const handleEdit = async (review: Location) => {
        setEditingReviewId(review.id ?? null);
        setRating(review.rating ?? 0);
        setComment(review.comment ?? '');
    }

    const handleUpdate = async (id: number) => {
        await updateReview(id, rating, comment);
        const updatedReviews = reviews?.map(review => {
            if (review.id === id) {
                return { ...review, rating, comment };
            }
            return review;
        });
        setReviews(updatedReviews);
        setEditingReviewId(null);
        setRating(0);
        setComment('');
    }

    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827', marginVertical: 6, textAlign: 'center' }}>
            Your Reviewed Places
        </Text>
        
        <FlatList 
            data={reviews}
            ref={flatListRef}
            keyExtractor={(item) => item.id!.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item: review }) => (
                editingReviewId === review.id ? (
                    <View style={styles.card}>
                        <Text style={styles.placeName}>{review.place_name}</Text>
                        <Text style={styles.address}>{review.address}</Text>
                        <StarRating onChange={setRating} rating={rating} starSize={20} maxStars={5}/>
                        <TextInput style={styles.editCommentBox} value={comment} onChangeText={setComment} placeholder="Write your comment here..."/>
                        <TouchableOpacity style={styles.submitButton} onPress={() => handleUpdate(review.id!)}>
                            <Text style={styles.primaryButtonText}>Update Review</Text>
                        </TouchableOpacity>
                        <Ionicons style={styles.closeIcon} name="close" size={20} color="#4B5563" onPress={() => setEditingReviewId(null)} />
                    </View>
                ) : (
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}> 
                            
                            <View style={{ flex: 1, marginRight: 12 }}> 
                                <Text style={styles.placeName}>{review.place_name}</Text>
                                <Text style={styles.address}>{review.address}</Text>
                                <StarRatingDisplay rating={review.rating ?? 0} starSize={20} maxStars={5}/>
                                <Text style={styles.displayCommentBox} numberOfLines={4}>
                                    {review.comment}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'column', justifyContent: 'space-around', height: 80 }}>
                                <TouchableOpacity onPress={() => handleEdit(review)}>
                                    <Ionicons name="pencil" size={20} color="#4B5563" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(review.id!)}>
                                    <Ionicons name="trash" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            )}
        />
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    address: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    displayCommentBox: {
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        fontSize: 14,
        color: '#111827',
        textAlignVertical: 'top',
        padding: 8,
        marginTop: 8,
    },
    editCommentBox: {
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        fontSize: 14,
        color: '#111827',
        textAlignVertical: 'top',
        padding: 8,
        marginTop: 8,
    },
    submitButton: {
        marginTop: 4,
        backgroundColor: '#34C759',
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
    closeIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
});