import Ionicons from '@expo/vector-icons/Ionicons';
import { ReviewEntry } from '../services/reviews';

type Props = {
    size: number;
    reviews: ReviewEntry[]
}

const PIN_COLORS = {
    bad: '#FF0000', // Red
    average: '#FFA500', // Orange
    good: '#008000', // Green
}

function getPinColor(average_food_rating: number): string {
    const roundedRating = Math.round(average_food_rating);

    if (roundedRating <= 2) {
        return PIN_COLORS.bad;
    } else if (roundedRating === 3) {
        return PIN_COLORS.average;
    } else {
        return PIN_COLORS.good;
    }
}

export default function MapPin({size, reviews}: Props) {
    const average_food_rating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.food_rating, 0) / reviews.length
        : 0;

    return (
        <Ionicons name="location-sharp" size={size} color={getPinColor(average_food_rating)} />
    )
}