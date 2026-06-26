import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { deleteReview, ReviewEntry } from '@/services/reviews';
import { StarRatingDisplay } from 'react-native-star-rating-widget'
import PhotosList from '@/components/PhotosList';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';


type HorizontalListProps = {
    DATA: ReviewEntry[];
    onEdit: (entry: ReviewEntry) => void;
};


export default function ReviewCardList({ DATA, onEdit }: HorizontalListProps) {
  const [index, setIndex] = useState(0);
  const queryClient = useQueryClient();

  const slide = (direction: 'left' | 'right') => {
    const nextIndex = direction === 'left' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= DATA.length) return;
    setIndex(nextIndex);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const item = DATA[index];
  
  // Delete Handler
  const handleDelete = async() => {
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReview(item.id);
              await queryClient.invalidateQueries({ queryKey: ['reviews'] });
              Alert.alert("Success", "Review deleted successfully.");
              router.back();
            } catch (error: any) {
              Alert.alert("Error", error.message || "An error occurred while deleting the review.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.reviewsCard}>
      <View style={styles.reviewsHeader}>
        <Text style={styles.reviewsTitle}>Visit {DATA.length - index} of {DATA.length}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
            <Ionicons name="pencil" size={15} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnDanger} onPress={handleDelete}>
            <Ionicons name="trash" size={15} color="#e53935" />
          </TouchableOpacity>
          <View style={styles.headerDivider} />
          <TouchableOpacity onPress={() => slide('left')} disabled={index === 0}>
            <Ionicons name="arrow-back-circle" size={24} color={index === 0 ? '#ccc' : '#333'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => slide('right')} disabled={index === DATA.length - 1}>
            <Ionicons name="arrow-forward-circle" size={24} color={index === DATA.length - 1 ? '#ccc' : '#333'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.reviewMetaRow}>
          <Text style={styles.reviewDate}>{item ? formatDate(item.created_at) : ''}</Text>
          <View style={styles.reviewMetaDetails}>
              {item?.meal_type && <Text style={styles.reviewMetaChip}>[ {item.meal_type} ]</Text>}
              {item?.amount_spent && <Text style={styles.reviewMetaChip}>[ SGD${item.amount_spent} ]</Text>}
          </View>
      </View>
      {item?.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
              {item.tags.map((tag: string, i: number) => (
                  <Text style={styles.tag} key={i}>{tag}</Text>
              ))}
          </View>
      )}
      <View style={styles.reviewRatingRow}>
          <Text style={styles.reviewRatingLabel}>Food</Text>
          <StarRatingDisplay starSize={20} rating={item?.food_rating ?? 0} />
      </View>
      <View style={styles.reviewRatingRow}>
          <Text style={styles.reviewRatingLabel}>Atmosphere</Text>
          <StarRatingDisplay starSize={20} rating={item?.atmosphere_rating ?? 0} />
      </View>
      <View style={styles.reviewRatingRow}>
          <Text style={styles.reviewRatingLabel}>Worth It</Text>
          <StarRatingDisplay starSize={20} rating={item?.worth_it_rating ?? 0} />
      </View>
      {item?.image_urls && item.image_urls.length > 0 && (
          <PhotosList DATA={item.image_urls} />
      )}
      {item?.remarks && (
          <View style={styles.remarksContainer}>
              <Text style={styles.remarksTitle}>Remarks</Text>
              <Text style={styles.remarksText}>{item.remarks}</Text>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    reviewsCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ececec',
    },
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    reviewsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },
    reviewMetaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    reviewDate: {
        fontSize: 13,
        color: '#555',
    },
    reviewMetaDetails: {
        flexDirection: 'row',
        gap: 4,
    },
    reviewMetaChip: {
        fontSize: 12,
        color: '#555',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    tag: {
        backgroundColor: '#ffa200',
        color: 'black',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
    },
    reviewRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#ececec',
    },
    reviewRatingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    actionBtn: {
        backgroundColor: '#efefef',
        borderRadius: 8,
        padding: 6,
    },
    actionBtnDanger: {
        backgroundColor: '#fdecea',
        borderRadius: 8,
        padding: 6,
    },
    headerDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#ddd',
        marginHorizontal: 2,
    },
    remarksContainer: {
        marginTop: 12,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
    },
    remarksTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#888',
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    remarksText: {
        fontSize: 14,
        color: 'black',
        lineHeight: 20,
    },
  });