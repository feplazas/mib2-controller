import { useState, ReactNode } from "react";
import { Text, View, LayoutAnimation, Platform, UIManager } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExpandableInfoProps {
  /** Texto o icono del botón de toggle */
  toggleLabel: string;
  /** Contenido expandible */
  children: ReactNode;
  /** Color del icono y texto del toggle */
  color?: string;
  /** Estilo inicial (expandido o colapsado) */
  initialExpanded?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Clase CSS para el contenido expandido */
  contentClassName?: string;
}

/**
 * ExpandableInfo - Componente de información expandible/colapsable
 * 
 * Muestra un botón con icono de información que al presionar
 * expande/colapsa el contenido con animación suave.
 */
export function ExpandableInfo({
  toggleLabel,
  children,
  color,
  initialExpanded = false,
  className = "",
  contentClassName = "",
}: ExpandableInfoProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const colors = useColors();
  const iconColor = color || colors.primary;
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(initialExpanded ? 90 : 0);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      scale.value = withTiming(0.95, {
        duration: 80,
        easing: Easing.out(Easing.quad),
      });
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.quad),
      });
    })
    .onEnd(() => {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Animar rotación del icono
      rotation.value = withTiming(isExpanded ? 0 : 90, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      
      // Configurar animación de layout
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(!isExpanded);
    })
    .runOnJS(true);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className={className}>
      {/* Botón de toggle */}
      <GestureDetector gesture={tapGesture}>
        <Animated.View 
          style={animatedButtonStyle}
          className="flex-row items-center gap-2 py-2"
        >
          <Animated.View style={animatedIconStyle}>
            <Text style={{ color: iconColor, fontSize: 12 }}>▶</Text>
          </Animated.View>
          <Text style={{ color: iconColor }} className="text-xs font-medium">
            {toggleLabel}
          </Text>
        </Animated.View>
      </GestureDetector>
      
      {/* Contenido expandible */}
      {isExpanded && (
        <View className={`mt-2 ${contentClassName}`}>
          {children}
        </View>
      )}
    </View>
  );
}
