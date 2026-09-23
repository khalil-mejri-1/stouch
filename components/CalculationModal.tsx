import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface CalculationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  incomeTotal: number;
  expenseTotal: number;
  netTotal: number;
  incomeCount: number;
  expenseCount: number;
  currency?: string;
  isRTL: boolean;
  isDark: boolean;
  colors: any;
  t: (key: string, def?: string) => string;
}

export const CalculationModal: React.FC<CalculationModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  incomeTotal,
  expenseTotal,
  netTotal,
  incomeCount,
  expenseCount,
  currency = 'DT',
  isRTL,
  isDark,
  colors,
  t,
}) => {
  const formatNum = (val: number) => {
    return Math.abs(val).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const isNetPositive = netTotal > 0;
  const isNetZero = Math.abs(netTotal) < 0.001;
  const totalCount = incomeCount + expenseCount;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                },
              ]}
            >
              {/* Header with Icon, Title, and Close Button */}
              <View style={[styles.headerRow, !isRTL && { flexDirection: 'row-reverse' }]}>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    onClose();
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[
                    styles.closeBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    },
                  ]}
                >
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={isDark ? '#E2E8F0' : '#475569'}
                  />
                </TouchableOpacity>

                <View style={[styles.titleGroup, !isRTL && { alignItems: 'flex-start' }]}>
                  <View style={[styles.titleWithIcon, !isRTL && { flexDirection: 'row' }]}>
                    <View
                      style={[
                        styles.calcIconWrap,
                        {
                          backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : '#FAF5FF',
                          borderColor: isDark ? 'rgba(192, 132, 252, 0.4)' : '#DDD6FE',
                        },
                      ]}
                    >
                      <MaterialIcons
                        name="calculate"
                        size={18}
                        color={isDark ? '#C084FC' : '#7C3AED'}
                      />
                    </View>
                    <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                      {title}
                    </Text>
                  </View>
                  {subtitle ? (
                    <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Main Net Total Highlight Card */}
              <View
                style={[
                  styles.netCard,
                  {
                    backgroundColor: isNetZero
                      ? (isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC')
                      : isNetPositive
                      ? (isDark ? 'rgba(5, 150, 105, 0.12)' : '#ECFDF5')
                      : (isDark ? 'rgba(220, 38, 38, 0.12)' : '#FEF2F2'),
                    borderColor: isNetZero
                      ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0')
                      : isNetPositive
                      ? (isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0')
                      : (isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA'),
                  },
                ]}
              >
                <View style={[styles.netHeaderRow, !isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.netLabel, { color: colors.textSecondary }]}>
                    {t('netTotal', 'المجموع الصافي')}
                  </Text>
                  <View
                    style={[
                      styles.netBadge,
                      {
                        backgroundColor: isNetZero
                          ? (isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0')
                          : isNetPositive
                          ? (isDark ? 'rgba(16, 185, 129, 0.25)' : '#D1FAE5')
                          : (isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2'),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.netBadgeText,
                        {
                          color: isNetZero
                            ? (isDark ? '#CBD5E1' : '#475569')
                            : isNetPositive
                            ? (isDark ? '#34D399' : '#059669')
                            : (isDark ? '#F87171' : '#DC2626'),
                        },
                      ]}
                    >
                      {isNetZero
                        ? t('balanced', 'متوازن')
                        : isNetPositive
                        ? t('surplus', 'فائض')
                        : t('deficit', 'عجز')}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.netAmount,
                    {
                      color: isNetZero
                        ? colors.textPrimary
                        : isNetPositive
                        ? (isDark ? '#34D399' : '#059669')
                        : (isDark ? '#F87171' : '#DC2626'),
                    },
                  ]}
                >
                  {isNetZero ? '' : isNetPositive ? '+ ' : '- '}
                  {formatNum(netTotal)} {currency}
                </Text>
              </View>

              {/* Grid: Income vs Expense Breakdown */}
              <View style={styles.breakdownGrid}>
                {/* Income Column */}
                <View
                  style={[
                    styles.breakdownCol,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : '#EEF2F6',
                    },
                  ]}
                >
                  <View style={[styles.colHeader, !isRTL && { flexDirection: 'row' }]}>
                    <View style={[styles.colDot, { backgroundColor: '#059669' }]} />
                    <Text style={[styles.colTitle, { color: colors.textSecondary }]}>
                      {t('totalIncome', 'المداخيل')}
                    </Text>
                  </View>
                  <Text style={[styles.colAmount, { color: isDark ? '#34D399' : '#059669' }]}>
                    + {formatNum(incomeTotal)} {currency}
                  </Text>
                  <Text style={[styles.colCount, { color: colors.textSecondary }]}>
                    {incomeCount} {t('itemsCount', 'عملية')}
                  </Text>
                </View>

                {/* Expense Column */}
                <View
                  style={[
                    styles.breakdownCol,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.07)' : '#EEF2F6',
                    },
                  ]}
                >
                  <View style={[styles.colHeader, !isRTL && { flexDirection: 'row' }]}>
                    <View style={[styles.colDot, { backgroundColor: '#DC2626' }]} />
                    <Text style={[styles.colTitle, { color: colors.textSecondary }]}>
                      {t('totalExpenses', 'المصاريف')}
                    </Text>
                  </View>
                  <Text style={[styles.colAmount, { color: isDark ? '#F87171' : '#DC2626' }]}>
                    - {formatNum(expenseTotal)} {currency}
                  </Text>
                  <Text style={[styles.colCount, { color: colors.textSecondary }]}>
                    {expenseCount} {t('itemsCount', 'عملية')}
                  </Text>
                </View>
              </View>

              {/* Total Items Summary Footer */}
              <View
                style={[
                  styles.footerInfoRow,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F1F5F9',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0',
                  },
                  !isRTL && { flexDirection: 'row' },
                ]}
              >
                <MaterialIcons
                  name="insights"
                  size={16}
                  color={isDark ? '#C084FC' : '#7C3AED'}
                />
                <Text style={[styles.footerInfoText, { color: colors.textSecondary }]}>
                  {totalCount} {t('itemsCount', 'عملية')} {t('selectedItems', 'مشمولة في الحساب')}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: isDark ? '#38BDF8' : '#0F172A',
                  },
                ]}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.submitBtnText,
                    { color: isDark ? '#080C15' : '#FFFFFF' },
                  ]}
                >
                  {t('close', 'إغلاق')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleGroup: {
    flex: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calcIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  netCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 14,
  },
  netHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  netLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  netBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  netBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  netAmount: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Outfit-Bold',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  breakdownCol: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  colDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  colTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  colAmount: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Outfit-Bold',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  colCount: {
    fontSize: 10.5,
  },
  footerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  footerInfoText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
