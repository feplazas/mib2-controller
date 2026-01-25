import { useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/use-colors";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabel?: boolean;
  labels?: string[];
}

/**
 * StarRating - Interactive Star Rating Component
 * 
 * Sistema de calificación con estrellas animadas,
 * feedback háptico y etiquetas opcionales.
 */
export function StarRating({
  rating,
  onRatingChange,
  maxStars = 5,
  size = 'md',
  readonly = false,
  showLabel = true,
  labels,
}: StarRatingProps) {
  const colors = useColors();
  
  const defaultLabels = [
    '', // 0 stars
    '😞', // 1 star
    '😐', // 2 stars
    '🙂', // 3 stars
    '😊', // 4 stars
    '🤩', // 5 stars
  ];

  const ratingLabels = labels || defaultLabels;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { starSize: 24, gap: 4 };
      case 'lg':
        return { starSize: 48, gap: 12 };
      default:
        return { starSize: 36, gap: 8 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.container}>
      <View style={[styles.starsContainer, { gap: sizeStyles.gap }]}>
        {Array.from({ length: maxStars }, (_, index) => (
          <Star
            key={index}
            index={index}
            filled={index < rating}
            size={sizeStyles.starSize}
            readonly={readonly}
            onPress={() => {
              if (!readonly && onRatingChange) {
                // Si presiona la misma estrella, quita la calificación
                const newRating = index + 1 === rating ? 0 : index + 1;
                onRatingChange(newRating);
              }
            }}
            colors={colors}
          />
        ))}
      </View>
      {showLabel && rating > 0 && (
        <Text style={[styles.label, { fontSize: sizeStyles.starSize * 0.8 }]}>
          {ratingLabels[rating] || ''}
        </Text>
      )}
    </View>
  );
}

interface StarProps {
  index: number;
  filled: boolean;
  size: number;
  readonly: boolean;
  onPress: () => void;
  colors: any;
}

function Star({ index, filled, size, readonly, onPress, colors }: StarProps) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const tapGesture = Gesture.Tap()
    .enabled(!readonly)
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(1.3, { damping: 8, stiffness: 400 });
      rotation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 50 })
      );
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    })
    .onEnd(() => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={animatedStyle}>
        <Text
          style={[
            styles.star,
            { fontSize: size },
            filled ? styles.starFilled : styles.starEmpty,
          ]}
        >
          {filled ? '★' : '☆'}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    textAlign: 'center',
  },
  starFilled: {
    color: '#FFD700', // Gold
  },
  starEmpty: {
    color: '#9CA3AF', // Gray
  },
  label: {
    textAlign: 'center',
  },
});
