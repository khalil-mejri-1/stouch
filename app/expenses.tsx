import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions, formatTransactionTime, formatTransactionAmount } from '../context/TransactionsContext';
import { useLanguage, getCategoryLabel } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Custom glassmorphic card component
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
};

export default function ExpensesScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const { t, isRTL, currency } = useLanguage();
  const { colors, isDark } = useTheme();
  const expenses = transactions.filter(tx => tx.type === 'expense');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Row with Back Button */}
        <View style={[styles.header, { borderBottomColor: colors.border }, !isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color={colors.textPrimary}
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('expensesHistoryTitle')}</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listContainer}>
            {expenses.length === 0 ? (
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 14 }}>
                {t('noExpensesYet')}
              </Text>
            ) : (
              expenses.map((item) => {
                const accentColor = item.iconColor || (isDark ? '#F87171' : '#DC2626');
                return (
                  <GlassCard
                    key={item.id}
                    style={[
                      styles.expenseCard,
                      { backgroundColor: colors.expenseBg, borderColor: colors.expenseBorder },
                      isRTL
                        ? { borderRightWidth: 4, borderRightColor: accentColor }
                        : { borderLeftWidth: 4, borderLeftColor: accentColor },
                      !isRTL && { flexDirection: 'row-reverse' },
                    ]}
                  >
                    <View style={[styles.itemLeft, !isRTL && { alignItems: 'flex-end' }]}>
                      <Text style={[styles.amountText, { color: colors.expenseText }]}>{formatTransactionAmount(item, currency)}</Text>
                      <View
                        style={[
                          styles.tagContainer,
                          {
                            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.22)' : '#FEE2E2',
                            borderColor: isDark ? 'rgba(248, 113, 113, 0.35)' : '#FECACA',
                          },
                        ]}
                      >
                        <Text style={[styles.tagText, { color: colors.expenseText }]}>
                          {getCategoryLabel(item.tag, t)}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.itemRight,
                        isRTL ? { marginRight: 4, alignItems: 'flex-end' } : { marginLeft: 4, alignItems: 'flex-start' },
                      ]}
                    >
                      <View style={[styles.titleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <View
                          style={[
                            styles.categoryDot,
                            {
                              backgroundColor: accentColor,
                            },
                            isRTL ? { marginLeft: 7 } : { marginRight: 7 },
                          ]}
                        />
                        <Text
                          style={[styles.titleText, { color: colors.textPrimary }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.title}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.timeText,
                          { color: colors.textSecondary },
                          isRTL ? { paddingRight: 14, textAlign: 'right' } : { paddingLeft: 14, textAlign: 'left' },
                        ]}
                      >
                        {formatTransactionTime(item.time)}
                      </Text>
                    </View>
                  </GlassCard>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 24 : 44,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 12,
  },
  glassCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: {
    alignItems: 'flex-start',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 6,
  },
  tagContainer: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemRight: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    alignItems: 'center',
  },
  categoryDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
});
