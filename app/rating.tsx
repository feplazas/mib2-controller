import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedCard } from "@/components/ui/animated-card";
import { StarRating } from "@/components/ui/star-rating";
import { useTranslation } from "@/lib/language-context";
import { useColors } from "@/hooks/use-colors";

const RATING_STORAGE_KEY = '@mib2_app_rating';
const RATING_FEEDBACK_KEY = '@mib2_app_rating_feedback';

interface RatingData {
  rating: number;
  feedback?: string;
  timestamp: number;
}

/**
 * Rating Screen - App Rating with Stars
 * 
 * Sistema de calificación con estrellas animadas,
 * campo de feedback opcional, y persistencia local.
 */
export default function RatingScreen() {
  const t = useTranslation();
  const colors = useColors();
  
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [existingRating, setExistingRating] = useState<RatingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  // Cargar calificación existente
  useEffect(() => {
    loadExistingRating();
  }, []);

  const loadExistingRating = async () => {
    try {
      const stored = await AsyncStorage.getItem(RATING_STORAGE_KEY);
      if (stored) {
        const data: RatingData = JSON.parse(stored);
        setExistingRating(data);
        setRating(data.rating);
        setFeedback(data.feedback || "");
      }
    } catch (error) {
      console.error('[Rating] Error loading existing rating:', error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(t('common.error'), t('rating.tap_to_rate'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const ratingData: RatingData = {
        rating,
        feedback: feedback.trim() || undefined,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(ratingData));
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setShowThanks(true);
      setExistingRating(ratingData);
      
      // Volver después de mostrar agradecimiento
      setTimeout(() => {
        router.back();
      }, 2000);
      
    } catch (error) {
      console.error('[Rating] Error saving rating:', error);
      Alert.alert(t('common.error'), String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number): string => {
    switch (stars) {
      case 1: return t('rating.label_1');
      case 2: return t('rating.label_2');
      case 3: return t('rating.label_3');
      case 4: return t('rating.label_4');
      case 5: return t('rating.label_5');
      default: return '';
    }
  };

  // Pantalla de agradecimiento
  if (showThanks) {
    return (
      <ScreenContainer className="p-4">
        <View className="flex-1 items-center justify-center">
          <AnimatedCard style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🎉</Text>
            <Text 
              style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: colors.foreground,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {t('rating.thanks_title')}
            </Text>
            <Text 
              style={{ 
                fontSize: 16, 
                color: colors.muted,
                textAlign: 'center',
              }}
            >
              {t('rating.thanks_message')}
            </Text>
            
            <View style={{ marginTop: 24 }}>
              <StarRating rating={rating} readonly size="lg" showLabel={false} />
            </View>
          </AnimatedCard>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header con botón de volver */}
        <AnimatedButton
          variant="ghost"
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: 16 }}
        >
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
            ← {t('common.back')}
          </Text>
        </AnimatedButton>

        {/* Título */}
        <View style={{ gap: 8, marginBottom: 32 }}>
          <Text 
            style={{ 
              fontSize: 32, 
              fontWeight: 'bold', 
              color: colors.foreground 
            }}
          >
            ⭐ {t('rating.title')}
          </Text>
          <Text style={{ fontSize: 16, color: colors.muted }}>
            {t('rating.subtitle')}
          </Text>
        </View>

        {/* Tarjeta de calificación */}
        <AnimatedCard 
          variant={existingRating ? 'highlight' : 'default'}
          style={{ marginBottom: 24 }}
        >
          {existingRating && (
            <View 
              style={{ 
                backgroundColor: colors.primary + '15',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                alignSelf: 'flex-start',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                {t('rating.already_rated')} • {t('rating.change_rating')}
              </Text>
            </View>
          )}

          <Text 
            style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: colors.foreground,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            {t('rating.question')}
          </Text>

          {/* Estrellas */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
              showLabel={false}
            />
          </View>

          {/* Etiqueta de calificación */}
          {rating > 0 && (
            <View 
              style={{ 
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text 
                style={{ 
                  fontSize: 18, 
                  fontWeight: '600',
                  color: rating >= 4 ? '#22C55E' : rating >= 3 ? '#F59E0B' : '#EF4444',
                }}
              >
                {getRatingLabel(rating)}
              </Text>
            </View>
          )}

          {rating === 0 && (
            <Text 
              style={{ 
                fontSize: 14, 
                color: colors.muted,
                textAlign: 'center',
              }}
            >
              {t('rating.tap_to_rate')}
            </Text>
          )}
        </AnimatedCard>

        {/* Campo de feedback opcional */}
        {rating > 0 && (
          <AnimatedCard style={{ marginBottom: 24 }}>
            <Text 
              style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: colors.foreground,
                marginBottom: 12,
              }}
            >
              💬 {t('rating.feedback_placeholder')}
            </Text>
            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder={t('rating.feedback_placeholder')}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 16,
                color: colors.foreground,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
            />
          </AnimatedCard>
        )}

        {/* Botón de enviar */}
        {rating > 0 && (
          <AnimatedButton
            title={t('rating.submit')}
            icon="📤"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit}
          />
        )}

        {/* Botones secundarios */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <AnimatedButton
            title={t('rating.rate_later')}
            variant="outline"
            size="md"
            fullWidth
            onPress={() => router.back()}
            style={{ flex: 1 }}
          />
        </View>

        {/* Info footer */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
            MIB2 Controller v1.0.0
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4, textAlign: 'center' }}>
            {t('rating.subtitle')}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
