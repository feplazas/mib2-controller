import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { OperationHistoryManager, type OperationStats } from '@/lib/operation-history';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useColors } from '@/hooks/use-colors';

const { width } = Dimensions.get('window');
const chartWidth = width - 48; // padding

export default function StatsScreen() {
  const colors = useColors();
  const [stats, setStats] = useState<OperationStats | null>(null);
  const [recentOps, setRecentOps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [statsData, recentData] = await Promise.all([
        OperationHistoryManager.getStatistics(),
        OperationHistoryManager.getRecentOperations(5),
      ]);

      setStats(statsData);
      setRecentOps(recentData);
    } catch (error) {
      console.error('[Stats] Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text className="text-muted mt-4">Loading statistics...</Text>
      </ScreenContainer>
    );
  }

  if (!stats || stats.totalOperations === 0) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-foreground mb-2">No Data Available</Text>
          <Text className="text-sm text-muted text-center">
            Statistics will appear here after you perform operations
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const successRate = stats.totalOperations > 0
    ? ((stats.successfulOperations / stats.totalOperations) * 100).toFixed(1)
    : '0.0';

  // Datos para gráfico de tasa de éxito
  const successPieData = [
    {
      name: 'Success',
      population: stats.successfulOperations,
      color: '#22C55E',
      legendFontColor: colors.foreground,
      legendFontSize: 14,
    },
    {
      name: 'Failed',
      population: stats.failedOperations,
      color: '#EF4444',
      legendFontColor: colors.foreground,
      legendFontSize: 14,
    },
  ];

  // Datos para gráfico de operaciones por tipo
  const typeBarData = {
    labels: ['Spoofing', 'Recovery', 'Restore'],
    datasets: [
      {
        data: [
          stats.operationsByType.spoofing,
          stats.operationsByType.recovery,
          stats.operationsByType.restore,
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
    labelColor: (opacity = 1) => colors.foreground,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Statistics Dashboard</Text>
            <Text className="text-sm text-muted mt-2">
              Overview of all operations performed
            </Text>
          </View>

          {/* Summary Cards */}
          <View className="flex-row gap-2">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-3xl font-bold text-foreground">{stats.totalOperations}</Text>
              <Text className="text-xs text-muted mt-1">Total Operations</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-3xl font-bold text-success">{successRate}%</Text>
              <Text className="text-xs text-muted mt-1">Success Rate</Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{stats.averageExecutionTime}ms</Text>
              <Text className="text-xs text-muted mt-1">Avg. Time</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-warning">{stats.dryRunOperations}</Text>
              <Text className="text-xs text-muted mt-1">Dry Runs</Text>
            </View>
          </View>

          {/* Success Rate Chart */}
          {stats.totalOperations > 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-4">Success vs Failed</Text>
              <PieChart
                data={successPieData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}

          {/* Operations by Type Chart */}
          {(stats.operationsByType.spoofing + stats.operationsByType.recovery + stats.operationsByType.restore) > 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-4">Operations by Type</Text>
              <BarChart
                data={typeBarData}
                width={chartWidth}
                height={220}
                chartConfig={chartConfig}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
                showValuesOnTopOfBars
                style={{
                  borderRadius: 16,
                }}
              />
            </View>
          )}

          {/* Recent Operations Timeline */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">Recent Operations</Text>
            {recentOps.length === 0 ? (
              <Text className="text-sm text-muted text-center py-4">No recent operations</Text>
            ) : (
              <View className="gap-3">
                {recentOps.map((op, index) => (
                  <View key={index} className="flex-row items-center gap-3 pb-3 border-b border-border">
                    <View className={`w-3 h-3 rounded-full ${op.result === 'success' ? 'bg-success' : 'bg-error'}`} />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground capitalize">{op.operationType}</Text>
                      <Text className="text-xs text-muted">{formatDate(op.createdAt)}</Text>
                    </View>
                    <View className="items-end">
                      <Text className={`text-xs font-semibold ${op.result === 'success' ? 'text-success' : 'text-error'}`}>
                        {op.result.toUpperCase()}
                      </Text>
                      {op.executionTimeMs && (
                        <Text className="text-xs text-muted">{op.executionTimeMs}ms</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Bottom Padding */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
