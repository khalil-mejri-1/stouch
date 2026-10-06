import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Transaction, formatTransactionTime, formatTransactionAmount } from '../context/TransactionsContext';
import { getCategoryLabel } from '../context/LanguageContext';

interface AnimatedTransactionCardProps {
  tx: Transaction;
  isRTL: boolean;
  isDark: boolean;
  colors: any;
  t: (key: string, defaultText?: string) => string;
  onDeletePress: (tx: Transaction) => void;
  isDeleting: boolean;
  onDeleteAnimationComplete: (id: string) => void;
  isNew?: boolean;
  currency?: string;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (tx: Transaction) => void;
  onEditPress?: (tx: Transaction) => void;
  onToggleStatus?: (tx: Transaction) => void;
  onLongPressCard?: (tx: Transaction) => void;
}

export const AnimatedTransactionCard: React.FC<AnimatedTransactionCardProps> = ({
  tx,
  isRTL,
  isDark,
  colors,
  t,
  onDeletePress,
  isDeleting,
  onDeleteAnimationComplete,
  isNew = false,
  currency = 'DT',
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
  onEditPress,
  onToggleStatus,
  onLongPressCard,
}) => {
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(isNew ? -24 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(isNew ? 0.9 : 1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const dotScaleAnim = useRef(new Animated.Value(isNew ? 0.3 : 1)).current;

  // Fluid entry animation when newly added
  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(dotScaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.delay(900),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1100,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    }
  }, [isNew]);

  useEffect(() => {
    if (isDeleting) {
      Animated.parallel([
        Animated.timing(translateXAnim, {
          toValue: isRTL ? -140 : 140,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.82,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDeleteAnimationComplete(tx.id);
      });
    }
  }, [isDeleting]);

  const isIncome = tx.type === 'income';
  const isPending = isIncome && tx.status === 'pending';

  // Determine category/type accent color for the sleek edge stripe & glowing dot
  const accentColor = isPending
    ? (isDark ? '#FBBF24' : '#D97706')
    : isIncome
      ? (isDark ? '#34D399' : '#059669')
      : (isDark ? '#F87171' : '#DC2626');

  // Crisp, clear border color for the card (Yellow border for pending income!)
  const baseBorderColor = isPending
    ? (isDark ? 'rgba(245, 158, 11, 0.45)' : '#FCD34D')
    : isIncome
      ? (isDark ? 'rgba(52, 211, 153, 0.35)' : '#86EFAC')
      : (isDark ? 'rgba(248, 113, 113, 0.35)' : '#FECACA');

  const cardBgColor = isSelected
    ? (isDark
        ? (isPending ? 'rgba(245, 158, 11, 0.28)' : isIncome ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)')
        : (isPending ? '#FEF08A' : isIncome ? '#DCFCE7' : '#FEE2E2'))
    : (isDark
        ? (isPending ? 'rgba(245, 158, 11, 0.16)' : isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)')
        : (isPending ? '#FEF9C3' : isIncome ? '#F0FDF4' : '#FEF2F2'));

  const amountColor = isPending
    ? (isDark ? '#FBBF24' : '#B45309')
    : isIncome
      ? (isDark ? '#34D399' : '#059669')
      : (isDark ? '#F87171' : '#DC2626');

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [
          { translateX: translateXAnim },
          { translateY: translateYAnim },
          { scale: scaleAnim },
        ],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        delayLongPress={800}
        onLongPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } catch {}
          if (!isSelectMode) {
            onLongPressCard?.(tx);
          } else {
            onToggleSelect?.(tx);
          }
        }}
        onPress={() => {
          try {
            Haptics.selectionAsync();
          } catch {}
          if (isSelectMode) {
            onToggleSelect?.(tx);
          } else {
            onEditPress?.(tx);
          }
        }}
        style={{ width: '100%' }}
      >
        <Animated.View
          style={[
            styles.transactionCard,
            {
              backgroundColor: cardBgColor,
              borderColor: isSelected
                ? (isDark ? '#38BDF8' : '#0F172A')
                : glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [baseBorderColor, accentColor],
                  }),
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
            isPending && {
              borderWidth: 1.5,
            },
            isSelected && {
              borderWidth: 2,
              backgroundColor: isDark
                ? (isPending ? 'rgba(245, 158, 11, 0.28)' : isIncome ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)')
                : (isPending ? '#FEF08A' : isIncome ? '#DCFCE7' : '#FEE2E2'),
            },
            isRTL
              ? { borderRightWidth: isSelected ? 3.5 : (isPending ? 3.5 : 3), borderRightColor: isSelected ? (isDark ? '#38BDF8' : '#0F172A') : accentColor }
              : { borderLeftWidth: isSelected ? 3.5 : (isPending ? 3.5 : 3), borderLeftColor: isSelected ? (isDark ? '#38BDF8' : '#0F172A') : accentColor },
          ]}
        >
          {/* Multi-Select Checkbox Circle */}
          {isSelectMode && (
            <View
              style={[
                styles.selectCheckCircle,
                isSelected && {
                  backgroundColor: isDark ? '#38BDF8' : '#0F172A',
                  borderColor: isDark ? '#38BDF8' : '#0F172A',
                },
                !isSelected && {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.35)' : '#94A3B8',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                },
                isRTL ? { marginLeft: 10 } : { marginRight: 10 },
              ]}
            >
              {isSelected && (
                <MaterialIcons
                  name="check"
                  size={13}
                  color={isDark ? '#080C15' : '#FFFFFF'}
                />
              )}
            </View>
          )}

          {/* Main Information: Sleek minimal typography with glowing category dot */}
          <View
            style={[
              styles.txMainGroup,
              isRTL
                ? { marginRight: 4, alignItems: 'flex-end' }
                : { marginLeft: 4, alignItems: 'flex-start' },
            ]}
          >
            {/* Title Row with category glowing dot */}
            <View
              style={[
                styles.titleRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Animated.View
                style={[
                  styles.categoryDot,
                  {
                    backgroundColor: accentColor,
                    transform: [{ scale: dotScaleAnim }],
                  },
                  isRTL ? { marginLeft: 7 } : { marginRight: 7 },
                ]}
              />
              <Text
                style={[
                  styles.txTitle,
                  { color: colors.textPrimary },
                  isRTL && { textAlign: 'right' },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tx.title}
              </Text>
            </View>

            {/* Formatted Transaction Date and Time & Pending Note */}
            <View style={[styles.timeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text
                style={[
                  styles.txTime,
                  { color: colors.textSecondary },
                  isRTL
                    ? { paddingRight: 14, textAlign: 'right' }
                    : { paddingLeft: 14, textAlign: 'left' },
                ]}
              >
                {formatTransactionTime(tx.time)}
              </Text>
            </View>
          </View>

          {/* Price & Category / Status Tag Column */}
          <View
            style={[
              styles.txAmountCol,
              { alignItems: isRTL ? 'flex-start' : 'flex-end' },
              !isSelectMode && (isRTL ? { paddingLeft: 52 } : { paddingRight: 52 }),
            ]}
          >
            <Text
              style={[
                styles.txAmount,
                { color: amountColor },
              ]}
            >
              {formatTransactionAmount(tx, currency)}
            </Text>

            {/* Tag Badge: Yellow Pending badge if pending, or regular category badge */}
            <View style={[styles.badgesRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {isPending && (
                <View
                  style={[
                    styles.tagContainer,
                    styles.pendingBadge,
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

              <View
                style={[
                  styles.tagContainer,
                  {
                    backgroundColor: isPending
                      ? (isDark ? 'rgba(245, 158, 11, 0.16)' : '#FFFBEB')
                      : isIncome
                        ? (isDark ? 'rgba(16, 185, 129, 0.20)' : '#DCFCE7')
                        : (isDark ? 'rgba(239, 68, 68, 0.20)' : '#FEE2E2'),
                    borderColor: isPending
                      ? (isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A')
                      : isIncome
                        ? (isDark ? 'rgba(52, 211, 153, 0.40)' : '#86EFAC')
                        : (isDark ? 'rgba(248, 113, 113, 0.40)' : '#FCA5A5'),
                    alignSelf: isRTL ? 'flex-start' : 'flex-end',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    {
                      color: isPending
                        ? (isDark ? '#FBBF24' : '#B45309')
                        : isIncome
                          ? (isDark ? '#34D399' : '#047857')
                          : (isDark ? '#F87171' : '#B91C1C'),
                    },
                  ]}
                >
                  {getCategoryLabel(tx.tag, t)}
                </Text>
              </View>
            </View>
          </View>

          {/* Top Dedicated Action Buttons (Visible & Non-intrusive) */}
          {!isSelectMode && (
            <View
              style={[
                styles.topActionButtonsGroup,
                isRTL ? { left: 8, flexDirection: 'row' } : { right: 8, flexDirection: 'row-reverse' },
              ]}
            >
              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => onDeletePress(tx)}
                style={[
                  styles.cardActionBtn,
                  {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.22)' : '#FEE2E2',
                    borderColor: isDark ? 'rgba(248, 113, 113, 0.40)' : '#FCA5A5',
                  },
                ]}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <MaterialIcons
                  name="close"
                  size={12.5}
                  color={isDark ? '#F87171' : '#DC2626'}
                />
              </TouchableOpacity>

              {/* Edit Button */}
              <TouchableOpacity
                onPress={() => onEditPress?.(tx)}
                style={[
                  styles.cardActionBtn,
                  {
                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.20)' : '#EFF6FF',
                    borderColor: isDark ? 'rgba(96, 165, 250, 0.40)' : '#BFDBFE',
                  },
                ]}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <MaterialIcons
                  name="edit"
                  size={12}
                  color={isDark ? '#60A5FA' : '#2563EB'}
                />
              </TouchableOpacity>

              {/* Quick Receive Button for Pending Incomes */}
              {isPending && onToggleStatus && (
                <TouchableOpacity
                  onPress={() => onToggleStatus(tx)}
                  style={[
                    styles.cardActionBtn,
                    {
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.22)' : '#ECFDF5',
                      borderColor: isDark ? 'rgba(52, 211, 153, 0.45)' : '#A7F3D0',
                    },
                  ]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <MaterialIcons
                    name="check"
                    size={13}
                    color={isDark ? '#34D399' : '#059669'}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  selectCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionCard: {
    position: 'relative',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#EEF2F6',
    backgroundColor: '#FAFAFC',
    paddingVertical: 13,
    paddingHorizontal: 15,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topActionButtonsGroup: {
    position: 'absolute',
    top: 7,
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  cardActionBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteTxBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txMainGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  timeRow: {
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  txTime: {
    fontSize: 12,
  },
  txAmountCol: {
    justifyContent: 'center',
    paddingTop: 2,
  },
  txAmount: {
    fontFamily: 'Outfit-Bold',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  badgesRow: {
    alignItems: 'center',
    gap: 5,
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  pendingBadge: {
    alignItems: 'center',
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
