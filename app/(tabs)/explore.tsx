import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTransactions } from '../../context/TransactionsContext';
import { useLanguage, getCategoryLabel } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Custom glassmorphic card component
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
};

export default function ExploreScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const { t, isRTL, currency } = useLanguage();
  const { colors, isDark } = useTheme();

  // Filter expenses and sum total
  const expenses = transactions.filter(tx => tx.type === 'expense');
  const totalExpenses = expenses.reduce((acc, tx) => acc + tx.numericAmount, 0);

  // Group by category tag
  const categoriesMap: { [key: string]: number } = {};
  expenses.forEach(tx => {
    // Normalize category key to standard if known
    categoriesMap[tx.tag] = (categoriesMap[tx.tag] || 0) + tx.numericAmount;
  });

  const categoryColors: { [key: string]: { color: string, bgColor: string, icon: string } } = {
    'طعام': { color: '#f97316', bgColor: isDark ? 'rgba(251, 146, 60, 0.18)' : 'rgba(251, 146, 60, 0.1)', icon: 'restaurant' },
    'نقل': { color: '#60a5fa', bgColor: isDark ? 'rgba(96, 165, 250, 0.18)' : 'rgba(96, 165, 250, 0.1)', icon: 'directions-car' },
    'تسوق': { color: '#ec4899', bgColor: isDark ? 'rgba(236, 72, 153, 0.18)' : 'rgba(236, 72, 153, 0.1)', icon: 'shopping-bag' },
    'ترفيه': { color: '#A855F7', bgColor: isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(168, 85, 247, 0.1)', icon: 'movie' },
    'دخل': { color: '#66d9cc', bgColor: isDark ? 'rgba(102, 217, 204, 0.18)' : 'rgba(102, 217, 204, 0.1)', icon: 'payments' },
    'فواتير': { color: '#eab308', bgColor: isDark ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.1)', icon: 'receipt-long' },
    'عمل': { color: '#3b82f6', bgColor: isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(59, 130, 246, 0.1)', icon: 'work' },
    'أخرى': { color: '#9ca3af', bgColor: isDark ? 'rgba(156, 163, 175, 0.18)' : 'rgba(156, 163, 175, 0.1)', icon: 'category' },
  };

  const categories = Object.keys(categoriesMap).map((catName, index) => {
    const amount = categoriesMap[catName];
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) : 0;
    const config = categoryColors[catName] || { color: '#9ca3af', bgColor: isDark ? 'rgba(156, 163, 175, 0.18)' : 'rgba(156, 163, 175, 0.1)', icon: 'category' };

    return {
      id: index.toString(),
      rawTitle: catName,
      title: getCategoryLabel(catName, t),
      amount: `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`,
      progress: percentage,
      color: config.color,
      bgColor: config.bgColor,
      icon: config.icon
    };
  });

  // Calculate real daily expenses (0: Sun, 1: Mon, ... 6: Sat)
  const dailyExpenses = [0, 0, 0, 0, 0, 0, 0];
  expenses.forEach(tx => {
    const txDate = tx.timestamp ? new Date(tx.timestamp) : new Date();
    const dayIndex = txDate.getDay();
    dailyExpenses[dayIndex] += tx.numericAmount;
  });

  const maxDailyExpense = Math.max(...dailyExpenses);

  // Weekly spending heights for columns (Monday to Sunday)
  const weeklyData = [
    { key: 'mon', label: t('mon'), heightPercent: maxDailyExpense > 0 ? (dailyExpenses[1] / maxDailyExpense) * 100 : 0, amount: dailyExpenses[1] },
    { key: 'tue', label: t('tue'), heightPercent: maxDailyExpense > 0 ? (dailyExpenses[2] / maxDailyExpense) * 100 : 0, amount: dailyExpenses[2] },
    { key: 'wed', label: t('wed'), heightPercent: maxDailyExpense > 0 ? (dailyExpenses[3] / maxDailyExpense) * 100 : 0, amount: dailyExpenses[3] },
    { key: 'thu', label: t('thu'), heightPercent: maxDailyExpense > 0 ? (dailyExpenses[4] / maxDailyExpense) * 100 : 0, amount: dailyExpenses[4] },
    { key: 'fri', label: t('fri'), heightPercent: maxDailyExpense > 0 ? (dailyExpenses[5] / maxDailyExpense) * 100 : 0, amount: dailyExpenses[5] },
    { key: 'sat', label: t('sat'), heightPercent: maxDailyExpense > 0 ? (dailyExpenses[6] / maxDailyExpense) * 100 : 0, amount: dailyExpenses[6] },
    { key: 'sun', label: t('sun'), heightPercent: maxDailyExpense > 0 ? (dailyExpenses[0] / maxDailyExpense) * 100 : 0, amount: dailyExpenses[0] },
  ];

  // Default activeDay to current weekday key
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDayKey = dayKeys[new Date().getDay()];
  const [activeDay, setActiveDay] = useState(currentDayKey);

  const selectedDayData = weeklyData.find(d => d.key === activeDay);
  const activeDayAmount = selectedDayData ? selectedDayData.amount : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header Title */}
        <View style={[styles.header, { borderBottomColor: colors.border }, !isRTL && { alignItems: 'flex-start' }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('statsTitle')}</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Charts Section */}
          <View style={styles.chartsGrid}>
            {/* Donut Chart Card */}
            <GlassCard style={styles.donutCard}>
              <View style={[styles.cardHeader, !isRTL && { flexDirection: 'row-reverse' }]}>
                <MaterialCommunityIcons name="chart-pie" size={20} color={isDark ? '#2DD4BF' : '#0D9488'} />
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('categoryDistribution')}</Text>
              </View>

              {/* Dynamic SVG Donut Chart representation */}
              <View style={styles.donutContainer}>
                {totalExpenses > 0 ? (
                  <Svg width={210} height={210} viewBox="0 0 120 120" style={{ transform: [{ rotate: '-90deg' }] }}>
                    <Circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke={isDark ? '#1E293B' : '#F1F5F9'}
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {(() => {
                      let accumulatedPercent = 0;
                      const R = 48;
                      const C = 2 * Math.PI * R; // ~301.59

                      return ['طعام', 'نقل', 'تسوق', 'ترفيه', 'أخرى'].map((catKey) => {
                        const standardColors: { [key: string]: string } = {
                          'طعام': '#f97316',
                          'نقل': '#60a5fa',
                          'تسوق': '#ec4899',
                          'ترفيه': '#A855F7',
                          'أخرى': '#9ca3af',
                        };
                        const color = standardColors[catKey] || '#9ca3af';
                        const amount = categoriesMap[catKey] || 0;
                        const percentage = totalExpenses > 0 ? (amount / totalExpenses) : 0;

                        if (percentage === 0) return null;

                        const strokeDasharray = `${C * percentage} ${C}`;
                        const strokeDashoffset = -C * accumulatedPercent;
                        accumulatedPercent += percentage;

                        return (
                          <Circle
                            key={catKey}
                            cx="60"
                            cy="60"
                            r={R}
                            stroke={color}
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                          />
                        );
                      });
                    })()}
                  </Svg>
                ) : (
                  <Svg width={210} height={210} viewBox="0 0 120 120">
                    <Circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke={isDark ? '#1E293B' : '#F1F5F9'}
                      strokeWidth="10"
                      fill="transparent"
                    />
                  </Svg>
                )}

                <View style={styles.donutCenter}>
                  <Text style={[styles.donutCenterLabel, { color: colors.textSecondary }]}>{t('total')}</Text>
                  <Text style={[styles.donutCenterValue, { color: colors.textPrimary }]}>
                    {totalExpenses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={[styles.donutCenterCurrency, { color: isDark ? '#2DD4BF' : '#0D9488' }]}>{currency}</Text>
                </View>
              </View>

              {/* Donut Chart Legend */}
              <View style={styles.legendGrid}>
                {['طعام', 'نقل', 'تسوق', 'ترفيه', 'أخرى'].map((catKey) => {
                  const legendColors: { [key: string]: string } = {
                    'طعام': '#f97316',
                    'نقل': '#60a5fa',
                    'تسوق': '#ec4899',
                    'ترفيه': '#A855F7',
                    'أخرى': '#9ca3af',
                  };
                  const color = legendColors[catKey] || '#9ca3af';
                  const label = getCategoryLabel(catKey, t);
                  const amount = categoriesMap[catKey] || 0;
                  const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                  return (
                    <View
                      key={catKey}
                      style={[
                        styles.legendItem,
                        {
                          backgroundColor: colors.surfaceSecondary,
                          borderColor: colors.border,
                        },
                        !isRTL && { flexDirection: 'row-reverse' },
                      ]}
                    >
                      <Text style={{ fontSize: 10, color: colors.textSecondary }}>{pct}%</Text>
                      <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>{label}</Text>
                      <View style={[styles.legendColor, { backgroundColor: color }]} />
                    </View>
                  );
                })}
              </View>
            </GlassCard>

            {/* Spending Trend Card (Weekly) */}
            <GlassCard style={styles.trendCard}>
              <View style={[styles.cardHeader, !isRTL && { flexDirection: 'row-reverse' }]}>
                <View
                  style={[
                    styles.trendIndicator,
                    {
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                      borderColor: isDark ? 'rgba(52, 211, 153, 0.3)' : '#A7F3D0',
                    },
                  ]}
                >
                  <MaterialIcons name="payments" size={16} color={isDark ? '#34D399' : '#14B8A6'} />
                  <Text style={[styles.trendIndicatorText, { color: isDark ? '#34D399' : '#059669' }]}>
                    {activeDayAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
                  </Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t('weeklySpending')}</Text>
              </View>

              {/* Weekly bar columns */}
              <View style={styles.barsContainer}>
                {weeklyData.map((day) => {
                  const isHighlighted = activeDay === day.key;
                  return (
                    <TouchableOpacity
                      key={day.key}
                      style={styles.barColumn}
                      onPress={() => setActiveDay(day.key)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.barTrack, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                        {isHighlighted ? (
                          <LinearGradient
                            colors={['#0D9488', '#059669']}
                            style={[styles.barFill, { height: `${day.heightPercent}%` }]}
                          />
                        ) : (
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: `${day.heightPercent}%`,
                                backgroundColor: isDark ? '#334155' : '#E2E8F0',
                              },
                            ]}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.barLabel,
                          { color: colors.textSecondary },
                          isHighlighted && [styles.barLabelActive, { color: colors.textPrimary }],
                        ]}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </GlassCard>
          </View>

          {/* Detailed Breakdown List */}
          <View style={styles.breakdownSection}>
            <Text style={[styles.breakdownTitle, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
              {t('categoryDetails')}
            </Text>
            <View style={styles.breakdownList}>
              {categories.length === 0 ? (
                <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 24, fontSize: 14 }}>
                  {t('noCategoriesYet')}
                </Text>
              ) : (
                categories.map((cat) => (
                  <GlassCard
                    key={cat.id}
                    style={[styles.breakdownCard, !isRTL && { flexDirection: 'row-reverse' }]}
                  >
                    <View style={styles.breakdownLeft}>
                      <View style={[styles.breakdownRow, !isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={[styles.breakdownAmount, { color: colors.textPrimary }]}>{cat.amount}</Text>
                        <Text style={[styles.breakdownCategoryName, { color: colors.textPrimary }]}>{cat.title}</Text>
                      </View>
                      {/* Custom progress bar */}
                      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${cat.progress * 100}%`,
                              backgroundColor: cat.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    
                    <View style={[styles.categoryIconContainer, { backgroundColor: cat.bgColor, borderColor: colors.border }]}>
                      <MaterialIcons
                        name={cat.icon as any}
                        size={24}
                        color={cat.color}
                      />
                    </View>
                  </GlassCard>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Floating Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderColor: colors.navBorder }]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <View style={[styles.activeTabPill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9' }]}>
              <MaterialIcons name="leaderboard" size={22} color={isDark ? '#2DD4BF' : '#0D9488'} />
            </View>
          </TouchableOpacity>

          {/* Center Action Button (Floating Plus) */}
          <View style={styles.micButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/add-transaction')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={[styles.micButton, { borderColor: colors.background }]}
              >
                <MaterialIcons name="add" size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="home"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 110, // Space for compact custom tab bar
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 24 : 44,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  glassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartsGrid: {
    marginTop: 20,
    gap: 20,
  },
  donutCard: {
    padding: 20,
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  donutContainer: {
    width: 210,
    height: 210,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  donutCenterValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  donutCenterCurrency: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
    marginTop: 2,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  trendCard: {
    padding: 20,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4,
  },
  trendIndicatorText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 24,
    height: 100,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '600',
  },
  barLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  breakdownSection: {
    marginTop: 24,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'right',
  },
  breakdownList: {
    gap: 12,
  },
  breakdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  breakdownLeft: {
    flex: 1,
    marginRight: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  breakdownCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 280,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    paddingVertical: 2,
  },
  activeTabPill: {
    backgroundColor: '#F1F5F9',
    padding: 6,
    borderRadius: 12,
  },
  micButtonContainer: {
    top: -14,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
});
