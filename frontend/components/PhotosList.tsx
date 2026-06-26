import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

type HorizontalListProps = {
    DATA: string[];
};

export default function PhotosList({ DATA }: HorizontalListProps) {
  const [index, setIndex] = useState(0);

  const slide = (direction: 'left' | 'right') => {
    const nextIndex = direction === 'left' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= DATA.length) return;
    setIndex(nextIndex);
  };

  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ position: 'relative' }}>
        <Image
          source={{ uri: DATA[index] }}
          style={{ width: '100%', height: 200, borderRadius: 8 }}
          contentFit="cover"
        />
        <TouchableOpacity
          onPress={() => slide('left')}
          disabled={index === 0}
          style={{ position: 'absolute', left: 8, top: '50%', transform: [{ translateY: -15 }], opacity: index === 0 ? 0.3 : 1 }}
        >
          <Ionicons name="arrow-back-circle" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => slide('right')}
          disabled={index === DATA.length - 1}
          style={{ position: 'absolute', right: 8, top: '50%', transform: [{ translateY: -15 }], opacity: index === DATA.length - 1 ? 0.3 : 1 }}
        >
          <Ionicons name="arrow-forward-circle" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={{ textAlign: 'center', marginTop: 6, fontSize: 12, color: '#888' }}>
        {index + 1} / {DATA.length}
      </Text>
    </View>
  );
}
