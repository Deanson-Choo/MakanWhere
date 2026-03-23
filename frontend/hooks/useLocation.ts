import { useState, useCallback } from 'react';
import { fetchLocations, fetchLocationDetails } from '@/services/mapbox';
import { fetchReviewsByUserByLocation } from '@/services/reviews';
import { Suggestion } from '@/types/suggestion';
import { Location } from '@/types/location';

export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (query: string, sessionToken: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const data = await fetchLocations(query, sessionToken);
    
    if (data) {
      setSuggestions(data);
    }
    
    setIsLoading(false);
  }, []); // No dependencies, as fetchLocations is a stable function

  const getDetails = useCallback(async (mapboxId: string, sessionToken: string) => {
    setIsLoading(true);
    const review: Location | undefined = await fetchReviewsByUserByLocation(mapboxId);
    if (review) {
      setSelectedLocation(review); 
      setIsLoading(false);
      return review;
    }
    const data = await fetchLocationDetails(sessionToken, mapboxId);
    
    if (data) {
      setSelectedLocation(data);
    }
    
    setIsLoading(false);
    return data;
  }, []); // No dependencies, as fetchLocationDetails is a stable function

  return {
    suggestions,
    selectedLocation,
    isLoading,
    search,
    getDetails,
  };
}