import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * SkeletonLoader - Componente base con efecto shimmer
 * Muestra un placeholder animado mientras cargan los datos
 */
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1, // Repetir infinitamente
      false // No reversar
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-100, 100]
    );
    return {
      transform: [{ translateX: `${translateX}%` as any }],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

/**
 * SkeletonText - Skeleton para líneas de texto
 */
export function SkeletonText({
  lines = 1,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '60%',
  style,
}: {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string | number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
          borderRadius={4}
          style={{ marginBottom: index < lines - 1 ? spacing : 0 }}
        />
      ))}
    </View>
  );
}

/**
 * SkeletonCard - Skeleton para tarjetas completas
 */
export function SkeletonCard({
  showIcon = true,
  showTitle = true,
  showSubtitle = true,
  showContent = true,
  contentLines = 2,
  style,
}: {
  showIcon?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showContent?: boolean;
  contentLines?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        {showIcon && (
          <SkeletonLoader
            width={48}
            height={48}
            borderRadius={12}
            style={{ marginRight: 12 }}
          />
        )}
        <View style={styles.cardHeaderText}>
          {showTitle && (
            <SkeletonLoader
              width="70%"
              height={20}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
          )}
          {showSubtitle && (
            <SkeletonLoader
              width="50%"
              height={14}
              borderRadius={4}
            />
          )}
        </View>
      </View>
      {showContent && (
        <View style={styles.cardContent}>
          <SkeletonText lines={contentLines} lineHeight={14} />
        </View>
      )}
    </View>
  );
}

/**
 * SkeletonList - Skeleton para listas de items
 */
export function SkeletonList({
  items = 3,
  itemHeight = 72,
  showIcon = true,
  spacing = 12,
  style,
}: {
  items?: number;
  itemHeight?: number;
  showIcon?: boolean;
  spacing?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {Array.from({ length: items }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.listItem,
            { height: itemHeight, marginBottom: index < items - 1 ? spacing : 0 },
          ]}
        >
          {showIcon && (
            <SkeletonLoader
              width={40}
              height={40}
              borderRadius={20}
              style={{ marginRight: 12 }}
            />
          )}
          <View style={styles.listItemContent}>
            <SkeletonLoader
              width="60%"
              height={16}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <SkeletonLoader
              width="80%"
              height={12}
              borderRadius={4}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * SkeletonButton - Skeleton para botones
 */
export function SkeletonButton({
  width = '100%',
  height = 48,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius={12}
      style={style}
    />
  );
}

/**
 * SkeletonAvatar - Skeleton para avatares/iconos circulares
 */
export function SkeletonAvatar({
  size = 48,
  style,
}: {
  size?: number;
  style?: ViewStyle;
}) {
  return (
    <SkeletonLoader
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

/**
 * SkeletonBackupCard - Skeleton personalizado para tarjetas de backup EEPROM
 * Muestra la estructura exacta de una tarjeta de backup mientras carga
 */
export function SkeletonBackupCard({
  style,
}: {
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.backupCard, style]}>
      {/* Header con icono y fecha */}
      <View style={styles.backupHeader}>
        <View style={styles.backupHeaderLeft}>
          <SkeletonLoader
            width={40}
            height={40}
            borderRadius={10}
            style={{ marginRight: 12 }}
          />
          <View>
            <SkeletonLoader
              width={120}
              height={16}
              borderRadius={4}
              style={{ marginBottom: 6 }}
            />
            <SkeletonLoader
              width={80}
              height={12}
              borderRadius={4}
            />
          </View>
        </View>
        {/* Badge de estado */}
        <SkeletonLoader
          width={60}
          height={24}
          borderRadius={12}
        />
      </View>

      {/* Info del dispositivo */}
      <View style={styles.backupInfo}>
        <View style={styles.backupInfoRow}>
          <SkeletonLoader width={70} height={12} borderRadius={4} />
          <SkeletonLoader width={100} height={12} borderRadius={4} />
        </View>
        <View style={styles.backupInfoRow}>
          <SkeletonLoader width={50} height={12} borderRadius={4} />
          <SkeletonLoader width={80} height={12} borderRadius={4} />
        </View>
        <View style={styles.backupInfoRow}>
          <SkeletonLoader width={60} height={12} borderRadius={4} />
          <SkeletonLoader width={90} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.backupActions}>
        <SkeletonLoader width="30%" height={36} borderRadius={8} />
        <SkeletonLoader width="30%" height={36} borderRadius={8} />
        <SkeletonLoader width="30%" height={36} borderRadius={8} />
      </View>
    </View>
  );
}

/**
 * SkeletonBackupList - Lista de skeletons de backup
 */
export function SkeletonBackupList({
  items = 3,
  style,
}: {
  items?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonBackupCard
          key={index}
          style={{ marginBottom: index < items - 1 ? 12 : 0 }}
        />
      ))}
    </View>
  );
}

/**
 * SkeletonDeviceCard - Skeleton personalizado para tarjetas de dispositivo USB
 * Muestra la estructura de un dispositivo detectado mientras carga
 */
export function SkeletonDeviceCard({
  style,
}: {
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.deviceCard, style]}>
      {/* Icono y nombre */}
      <View style={styles.deviceHeader}>
        <SkeletonLoader
          width={48}
          height={48}
          borderRadius={12}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <SkeletonLoader
            width="70%"
            height={18}
            borderRadius={4}
            style={{ marginBottom: 6 }}
          />
          <SkeletonLoader
            width="50%"
            height={14}
            borderRadius={4}
          />
        </View>
        {/* Indicador de estado */}
        <SkeletonLoader
          width={12}
          height={12}
          borderRadius={6}
        />
      </View>

      {/* Detalles del dispositivo */}
      <View style={styles.deviceDetails}>
        <View style={styles.deviceDetailRow}>
          <SkeletonLoader width={60} height={11} borderRadius={3} />
          <SkeletonLoader width={100} height={11} borderRadius={3} />
        </View>
        <View style={styles.deviceDetailRow}>
          <SkeletonLoader width={70} height={11} borderRadius={3} />
          <SkeletonLoader width={80} height={11} borderRadius={3} />
        </View>
      </View>

      {/* Botón de conexión */}
      <SkeletonLoader
        width="100%"
        height={44}
        borderRadius={10}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

/**
 * SkeletonDeviceList - Lista de skeletons de dispositivos
 */
export function SkeletonDeviceList({
  items = 2,
  style,
}: {
  items?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonDeviceCard
          key={index}
          style={{ marginBottom: index < items - 1 ? 12 : 0 }}
        />
      ))}
    </View>
  );
}

/**
 * SkeletonSettingsRow - Skeleton para filas de configuración iOS-style
 */
export function SkeletonSettingsRow({
  showToggle = false,
  showChevron = true,
  style,
}: {
  showToggle?: boolean;
  showChevron?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.settingsRow, style]}>
      <View style={styles.settingsRowLeft}>
        <SkeletonLoader
          width={28}
          height={28}
          borderRadius={6}
          style={{ marginRight: 12 }}
        />
        <SkeletonLoader width={120} height={16} borderRadius={4} />
      </View>
      {showToggle ? (
        <SkeletonLoader width={51} height={31} borderRadius={16} />
      ) : showChevron ? (
        <SkeletonLoader width={8} height={14} borderRadius={2} />
      ) : null}
    </View>
  );
}

/**
 * SkeletonSettingsSection - Sección completa de configuración
 */
export function SkeletonSettingsSection({
  rows = 3,
  showHeader = true,
  style,
}: {
  rows?: number;
  showHeader?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {showHeader && (
        <SkeletonLoader
          width={100}
          height={12}
          borderRadius={4}
          style={{ marginBottom: 8, marginLeft: 16 }}
        />
      )}
      <View style={styles.settingsSection}>
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonSettingsRow
            key={index}
            showToggle={index === 0}
            style={{
              borderBottomWidth: index < rows - 1 ? 0.5 : 0,
              borderBottomColor: 'rgba(51, 65, 85, 0.3)',
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(155, 161, 166, 0.2)',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardContent: {
    marginTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  listItemContent: {
    flex: 1,
  },
  // Estilos para SkeletonBackupCard
  backupCard: {
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backupInfo: {
    marginTop: 16,
    gap: 8,
  },
  backupInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  // Estilos para SkeletonDeviceCard
  deviceCard: {
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceDetails: {
    marginTop: 12,
    gap: 6,
  },
  deviceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Estilos para SkeletonSettingsRow
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsSection: {
    backgroundColor: 'rgba(30, 32, 34, 0.8)',
    borderRadius: 12,
    overflow: 'hidden',
  },
});


/**
 * SkeletonNetworkScan - Skeleton animado para escaneo de red
 * Muestra un indicador visual premium mientras se escanea la red
 */
export function SkeletonNetworkScan({
  message = 'Escaneando...',
  progress = 0,
  showProgress = true,
  style,
}: {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  style?: ViewStyle;
}) {
  const pulseOpacity = useSharedValue(0.4);
  const scanLinePosition = useSharedValue(0);

  useEffect(() => {
    // Animación de pulso
    pulseOpacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    // Animación de línea de escaneo
    scanLinePosition.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLinePosition.value * 100}%`,
  }));

  return (
    <View style={[networkScanStyles.container, style]}>
      {/* Radar/Scan Animation */}
      <View style={networkScanStyles.radarContainer}>
        <Animated.View style={[networkScanStyles.radarOuter, pulseStyle]} />
        <Animated.View style={[networkScanStyles.radarMiddle, pulseStyle]} />
        <Animated.View style={[networkScanStyles.radarInner, pulseStyle]} />
        <View style={networkScanStyles.radarCenter}>
          <View style={networkScanStyles.radarDot} />
        </View>
        {/* Scan line */}
        <Animated.View style={[networkScanStyles.scanLine, scanLineStyle]} />
      </View>

      {/* Message */}
      <Animated.Text style={[networkScanStyles.message, pulseStyle]}>
        {message}
      </Animated.Text>

      {/* Progress Bar */}
      {showProgress && progress > 0 && (
        <View style={networkScanStyles.progressContainer}>
          <View style={networkScanStyles.progressBackground}>
            <View 
              style={[
                networkScanStyles.progressFill, 
                { width: `${Math.min(progress, 100)}%` }
              ]} 
            />
          </View>
          <Text style={networkScanStyles.progressText}>{Math.round(progress)}%</Text>
        </View>
      )}
    </View>
  );
}

/**
 * NetworkScanningOverlay - Overlay completo para escaneo de red
 * Se muestra sobre el contenido mientras se realiza el escaneo
 */
export function NetworkScanningOverlay({
  visible,
  message = 'Escaneando red...',
  progress = 0,
  showProgress = true,
  onCancel,
}: {
  visible: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  onCancel?: () => void;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    pointerEvents: visible ? 'auto' : 'none',
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[networkScanStyles.overlay, overlayStyle]}>
      <View style={networkScanStyles.overlayContent}>
        <SkeletonNetworkScan 
          message={message} 
          progress={progress}
          showProgress={showProgress}
        />
        {onCancel && (
          <View style={networkScanStyles.cancelButton}>
            <Text style={networkScanStyles.cancelText}>Cancelar</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const networkScanStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  radarContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  radarOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  radarMiddle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  radarInner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  radarCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0, 122, 255, 0.6)',
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 200,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: 'rgba(30, 32, 34, 0.95)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
