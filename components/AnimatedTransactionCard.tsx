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
  t: (key: string) => string;
  onDeletePress: (tx: Transaction) => void;
  isDeleting: boolean;
  onDeleteAnimationComplete: (id: string) => void;
  isNew?: boolean;
  currency?: string;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (tx: Transaction) => void;
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

  // Determine category/type accent color for the sleek edge stripe & glowing dot
  const accentColor = isIncome
    ? (isDark ? '#34D399' : '#059669')
    : (isDark ? '#F87171' : '#DC2626');

  // Crisp, clear border color for the card
  const baseBorderColor = isIncome
    ? (isDark ? 'rgba(52, 211, 153, 0.35)' : '#86EFAC')
    : (isDark ? 'rgba(248, 113, 113, 0.35)' : '#FECACA');

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
        activeOpacity={isSelectMode ? 0.75 : 1}
        onPress={isSelectMode ? () => {
          try {
            Haptics.selectionAsync();
          } catch {}
          onToggleSelect?.(tx);
        } : undefined}
        disabled={!isSelectMode}
        style={{ width: '100%' }}
      >
        <Animated.View
          style={[
            styles.transactionCard,
            {
              backgroundColor: isDark
                ? (isIncome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)')
                : (isIncome ? '#F0FDF4' : '#FEF2F2'),
              borderColor: isSelected
                ? (isDark ? '#38BDF8' : '#0F172A')
                : glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [baseBorderColor, accentColor],
                  }),
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
            isSelected && {
              borderWidth: 2,
              backgroundColor: isDark
                ? (isIncome ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)')
                : (isIncome ? '#DCFCE7' : '#FEE2E2'),
            },
            isRTL
              ? { borderRightWidth: isSelected ? 3.5 : 3, borderRightColor: isSelected ? (isDark ? '#38BDF8' : '#0F172A') : accentColor }
              : { borderLeftWidth: isSelected ? 3.5 : 3, borderLeftColor: isSelected ? (isDark ? '#38BDF8' : '#0F172A') : accentColor },
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



        {/* Main Information: Sleek minimal typography with glowing category dot (NO bulky icon box!) */}
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

          {/* Formatted Transaction Date and Time */}
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

        {/* Price & Category Tag Column */}
        <View
          style={[
            styles.txAmountCol,
            { alignItems: isRTL ? 'flex-start' : 'flex-end' },
            !isSelectMode && (isRTL ? { paddingLeft: 22 } : { paddingRight: 22 }),
          ]}
        >
          <Text
            style={[
              styles.txAmount,
              { color: isIncome ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F87171' : '#DC2626') },
            ]}
          >
            {formatTransactionAmount(tx, currency)}
          </Text>
          <View
            style={[
              styles.tagContainer,
              {
                backgroundColor: isIncome
                  ? (isDark ? 'rgba(16, 185, 129, 0.20)' : '#DCFCE7')
                  : (isDark ? 'rgba(239, 68, 68, 0.20)' : '#FEE2E2'),
                borderColor: isIncome
                  ? (isDark ? 'rgba(52, 211, 153, 0.40)' : '#86EFAC')
                  : (isDark ? 'rgba(248, 113, 113, 0.40)' : '#FCA5A5'),
                alignSelf: isRTL ? 'flex-start' : 'flex-end',
              },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: isIncome ? (isDark ? '#34D399' : '#047857') : (isDark ? '#F87171' : '#B91C1C') },
              ]}
            >
              {getCategoryLabel(tx.tag, t)}
            </Text>
          </View>
        </View>

        {/* Top Dedicated Delete Button (Visible & Non-intrusive) */}
        {!isSelectMode && (
          <TouchableOpacity
            onPress={() => onDeletePress(tx)}
            style={[
              styles.deleteTxBtn,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.22)' : '#FEE2E2',
                borderColor: isDark ? 'rgba(248, 113, 113, 0.40)' : '#FCA5A5',
              },
              isRTL ? { left: 8 } : { right: 8 },
            ]}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name="close"
              size={13}
              color={isDark ? '#F87171' : '#DC2626'}
            />
          </TouchableOpacity>
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
  deleteTxBtn: {
    position: 'absolute',
    top: 7,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  txMainGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    alignItems: 'center',
    marginBottom: 4,
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
  tagContainer: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
