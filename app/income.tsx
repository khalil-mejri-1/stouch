import React, { useState } from 'react';
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
import * as Haptics from 'expo-haptics';
import {
  useTransactions,
  formatTransactionTime,
  formatTransactionAmount,
  Transaction,
} from '../context/TransactionsContext';
import { useLanguage, getCategoryLabel } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { EditTransactionModal } from '../components/EditTransactionModal';

// Custom glassmorphic card component
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
};

export default function IncomeScreen() {
  const router = useRouter();
  const { transactions, updateTransaction, toggleTransactionStatus, deleteTransaction } = useTransactions();
  const { t, isRTL, currency } = useLanguage();
  const { colors, isDark } = useTheme();

  const [selectedTxForEdit, setSelectedTxForEdit] = useState<Transaction | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'received' | 'pending'>('all');

  const allIncomes = transactions.filter((tx) => tx.type === 'income');
  const receivedIncomes = allIncomes.filter((tx) => tx.status !== 'pending');
  const pendingIncomes = allIncomes.filter((tx) => tx.status === 'pending');

  const receivedTotal = receivedIncomes.reduce((acc, tx) => acc + (tx.numericAmount || 0), 0);
  const pendingTotal = pendingIncomes.reduce((acc, tx) => acc + (tx.numericAmount || 0), 0);

  const displayedIncomes = allIncomes.filter((tx) => {
    if (filterMode === 'received') return tx.status !== 'pending';
    if (filterMode === 'pending') return tx.status === 'pending';
    return true;
  });

  const handleCardPress = (tx: Transaction) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedTxForEdit(tx);
  };

  const handleToggleStatus = (tx: Transaction) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    toggleTransactionStatus(tx.id);
  };

  const handleSaveEdit = (
    id: string,
    updatedData: {
      title: string;
      numericAmount: number;
      type: 'income' | 'expense';
      tag: string;
      status?: 'received' | 'pending';
    }
  ) => {
    updateTransaction(id, updatedData);
    setSelectedTxForEdit(null);
  };

  const handleDelete = (tx: Transaction) => {
    deleteTransaction(tx.id);
    setSelectedTxForEdit(null);
  };

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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('incomeHistoryTitle')}</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Banner Card: Received vs Pending */}
          <GlassCard style={styles.summaryCard}>
            <View style={[styles.summaryRow, !isRTL && { flexDirection: 'row-reverse' }]}>
              {/* Received Income Total */}
              <View style={[styles.summaryCol, !isRTL && { alignItems: 'flex-start' }]}>
                <View style={[styles.summaryLabelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('receivedStatus')}
                  </Text>
                </View>
                <Text style={[styles.summaryAmountReceived, { color: isDark ? '#34D399' : '#059669' }]}>
                  +{receivedTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
                </Text>
              </View>

              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

              {/* Pending Income Total (Yellow Accent) */}
              <View style={[styles.summaryCol, !isRTL && { alignItems: 'flex-end' }]}>
                <View style={[styles.summaryLabelRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                    {t('pendingIncomesBadge', 'معلقة')}
                  </Text>
                </View>
                <Text style={[styles.summaryAmountPending, { color: isDark ? '#FBBF24' : '#D97706' }]}>
                  +{pendingTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
                </Text>
              </View>
            </View>

            {/* Filter Tabs: All, Received, Pending */}
            <View style={[styles.filterTabsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={[
                  styles.filterTabBtn,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  filterMode === 'all' && {
                    backgroundColor: isDark ? '#38BDF8' : '#0F172A',
                    borderColor: isDark ? '#38BDF8' : '#0F172A',
                  },
                ]}
                onPress={() => setFilterMode('all')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: colors.textSecondary },
                    filterMode === 'all' && { color: isDark ? '#080C15' : '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {t('all')} ({allIncomes.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTabBtn,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  filterMode === 'received' && {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#ECFDF5',
                    borderColor: isDark ? '#10B981' : '#059669',
                  },
                ]}
                onPress={() => setFilterMode('received')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: colors.textSecondary },
                    filterMode === 'received' && { color: isDark ? '#34D399' : '#059669', fontWeight: '700' },
                  ]}
                >
                  {t('receivedStatus')} ({receivedIncomes.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterTabBtn,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  filterMode === 'pending' && {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FEF9C3',
                    borderColor: isDark ? '#F59E0B' : '#D97706',
                  },
                ]}
                onPress={() => setFilterMode('pending')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: colors.textSecondary },
                    filterMode === 'pending' && { color: isDark ? '#FBBF24' : '#B45309', fontWeight: '700' },
                  ]}
                >
                  ⏳ {t('pendingIncomesBadge', 'معلقة')} ({pendingIncomes.length})
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* List of Incomes */}
          <View style={styles.listContainer}>
            {displayedIncomes.length === 0 ? (
              <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 14 }}>
                {t('noIncomeYet')}
              </Text>
            ) : (
              displayedIncomes.map((item) => {
                const isPending = item.status === 'pending';
                const accentColor = isPending
                  ? (isDark ? '#FBBF24' : '#D97706')
                  : (item.iconColor || (isDark ? '#34D399' : '#059669'));

                const cardBg = isPending
                  ? (isDark ? 'rgba(245, 158, 11, 0.16)' : '#FEF9C3')
                  : colors.incomeBg;

                const cardBorder = isPending
                  ? (isDark ? 'rgba(245, 158, 11, 0.45)' : '#F59E0B')
                  : colors.incomeBorder;

                const amountColor = isPending
                  ? (isDark ? '#FBBF24' : '#B45309')
                  : colors.incomeText;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.75}
                    onPress={() => handleCardPress(item)}
                  >
                    <GlassCard
                      style={[
                        styles.incomeCard,
                        { backgroundColor: cardBg, borderColor: cardBorder },
                        isPending && { borderWidth: 1.5 },
                        isRTL
                          ? { borderRightWidth: 4, borderRightColor: accentColor }
                          : { borderLeftWidth: 4, borderLeftColor: accentColor },
                        !isRTL && { flexDirection: 'row-reverse' },
                      ]}
                    >
                      {/* Left Side: Amount & Badges */}
                      <View style={[styles.itemLeft, !isRTL && { alignItems: 'flex-end' }]}>
                        <Text style={[styles.amountText, { color: amountColor }]}>
                          {formatTransactionAmount(item, currency)}
                        </Text>

                        <View style={[styles.tagsContainerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                          {/* Pending Badge if not received */}
                          {isPending && (
                            <View
                              style={[
                                styles.pendingTagBadge,
                                {
                                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.28)' : '#FEF08A',
                                  borderColor: isDark ? 'rgba(245, 158, 11, 0.50)' : '#FDE047',
                                  flexDirection: isRTL ? 'row-reverse' : 'row',
                                },
                              ]}
                            >
                              <MaterialIcons name="hourglass-empty" size={10} color={isDark ? '#FBBF24' : '#92400E'} />
                              <Text
                                style={[
                                  styles.tagText,
                                  { color: isDark ? '#FDE68A' : '#78350F', marginHorizontal: 2 },
                                ]}
                              >
                                {t('pendingIncomesBadge', 'معلقة')}
                              </Text>
                            </View>
                          )}

                          {/* Category Tag */}
                          <View
                            style={[
                              styles.tagContainer,
                              {
                                backgroundColor: isPending
                                  ? (isDark ? 'rgba(245, 158, 11, 0.16)' : '#FFFBEB')
                                  : (isDark ? 'rgba(16, 185, 129, 0.22)' : '#D1FAE5'),
                                borderColor: isPending
                                  ? (isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A')
                                  : (isDark ? 'rgba(52, 211, 153, 0.35)' : '#A7F3D0'),
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.tagText,
                                {
                                  color: isPending
                                    ? (isDark ? '#FBBF24' : '#B45309')
                                    : colors.incomeText,
                                },
                              ]}
                            >
                              {getCategoryLabel(item.tag, t)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Side: Title & Date */}
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

                      {/* Action Icons: Edit & Quick Status Toggle */}
                      <View
                        style={[
                          styles.actionButtonsCol,
                          isRTL ? { marginRight: 8 } : { marginLeft: 8 },
                        ]}
                      >
                        {isPending && (
                          <TouchableOpacity
                            style={[
                              styles.cardIconBtn,
                              {
                                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.22)' : '#ECFDF5',
                                borderColor: isDark ? 'rgba(52, 211, 153, 0.45)' : '#A7F3D0',
                              },
                            ]}
                            onPress={() => handleToggleStatus(item)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                          >
                            <MaterialIcons name="check" size={13} color={isDark ? '#34D399' : '#059669'} />
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={[
                            styles.cardIconBtn,
                            {
                              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.20)' : '#EFF6FF',
                              borderColor: isDark ? 'rgba(96, 165, 250, 0.40)' : '#BFDBFE',
                            },
                          ]}
                          onPress={() => handleCardPress(item)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                        >
                          <MaterialIcons name="edit" size={12} color={isDark ? '#60A5FA' : '#2563EB'} />
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        visible={!!selectedTxForEdit}
        transaction={selectedTxForEdit}
        onClose={() => setSelectedTxForEdit(null)}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
      />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabelRow: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryAmountReceived: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Outfit-Bold',
  },
  summaryAmountPending: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Outfit-Bold',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 12,
  },
  filterTabsRow: {
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.15)',
  },
  filterTabBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  listContainer: {
    gap: 12,
  },
  glassCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  incomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  itemLeft: {
    alignItems: 'flex-start',
  },
  amountText: {
    fontSize: 15.5,
    fontWeight: '700',
    marginBottom: 5,
    fontFamily: 'Outfit-Bold',
  },
  tagsContainerRow: {
    alignItems: 'center',
    gap: 4,
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  pendingTagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
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
    fontSize: 14.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  timeText: {
    fontSize: 11.5,
    marginTop: 3,
  },
  actionButtonsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
