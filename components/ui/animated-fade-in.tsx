import { ReactNode } from "react";
import { ViewStyle } from "react-native";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeIn,
  SlideInUp,
  SlideInDown,
  ZoomIn,
  BounceIn,
} from "react-native-reanimated";

type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'zoom' | 'bounce' | 'slide-up' | 'slide-down';

interface AnimatedFadeInProps {
  children: ReactNode;
  /** Dirección de la animación de entrada */
  direction?: AnimationDirection;
  /** Retraso en ms antes de iniciar la animación */
  delay?: number;
  /** Duración de la animación en ms */
  duration?: number;
  /** Índice para escalonar animaciones en listas */
  index?: number;
  /** Retraso base entre elementos escalonados (ms) */
  staggerDelay?: number;
  /** Estilos adicionales para el contenedor */
  style?: ViewStyle;
}

/**
 * AnimatedFadeIn - Componente de animación de entrada premium
 * 
 * Envuelve cualquier contenido con una animación de entrada suave.
 * Soporta múltiples direcciones y escalonamiento para listas.
 * 
 * @example
 * // Animación simple
 * <AnimatedFadeIn direction="up">
 *   <Card>...</Card>
 * </AnimatedFadeIn>
 * 
 * @example
 * // Lista escalonada
 * {items.map((item, index) => (
 *   <AnimatedFadeIn key={item.id} direction="up" index={index} staggerDelay={80}>
 *     <Card>...</Card>
 *   </AnimatedFadeIn>
 * ))}
 */
export function AnimatedFadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 400,
  index = 0,
  staggerDelay = 80,
  style,
}: AnimatedFadeInProps) {
  // Calcular delay total incluyendo escalonamiento
  const totalDelay = delay + (index * staggerDelay);

  // Seleccionar animación según dirección
  const getEnteringAnimation = () => {
    const baseAnimation = (() => {
      switch (direction) {
        case 'up':
          return FadeInUp;
        case 'down':
          return FadeInDown;
        case 'left':
          return FadeInLeft;
        case 'right':
          return FadeInRight;
        case 'fade':
          return FadeIn;
        case 'zoom':
          return ZoomIn;
        case 'bounce':
          return BounceIn;
        case 'slide-up':
          return SlideInUp;
        case 'slide-down':
          return SlideInDown;
        default:
          return FadeInUp;
      }
    })();

    return baseAnimation
      .delay(totalDelay)
      .duration(duration)
      .springify()
      .damping(15)
      .stiffness(100);
  };

  return (
    <Animated.View
      entering={getEnteringAnimation()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Hook para crear animaciones escalonadas en FlatList
 * 
 * @example
 * const { getItemDelay } = useStaggeredAnimation();
 * 
 * <FlatList
 *   data={items}
 *   renderItem={({ item, index }) => (
 *     <AnimatedFadeIn delay={getItemDelay(index)}>
 *       <Card>...</Card>
 *     </AnimatedFadeIn>
 *   )}
 * />
 */
export function useStaggeredAnimation(baseDelay = 0, staggerMs = 80) {
  return {
    getItemDelay: (index: number) => baseDelay + (index * staggerMs),
  };
}

export default AnimatedFadeIn;
