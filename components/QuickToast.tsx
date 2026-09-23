import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface QuickToastProps {
  visible: boolean;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  onDismiss: () => void;
}

export const QuickToast: React.FC<QuickToastProps> = ({
  visible,
  title,
  amount,
  type,
  onDismiss,
}) => {
  const { t, currency, isRTL } = useLanguage();
  const { colors, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
      scale.setValue(0.9);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const isIncome = type === 'income';
  const accentColor = isIncome ? (isDark ? '#34D399' : '#059669') : (isDark ? '#F87171' : '#DC2626');
  const bgColor = isDark
    ? (isIncome ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')
    : (isIncome ? '#ECFDF5' : '#FEF2F2');
  const borderColor = isDark
    ? (isIncome ? 'rgba(52, 211, 153, 0.35)' : 'rgba(248, 113, 113, 0.35)')
    : (isIncome ? '#A7F3D0' : '#FECACA');

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        style={[
          styles.toastContainer,
          { backgroundColor: colors.surface, borderColor },
          isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' },
        ]}
      >
        {/* Glow indicator line */}
        <View
          style={[
            styles.glowLine,
            { backgroundColor: accentColor },
            isRTL ? { right: 0 } : { left: 0 },
          ]}
        />

        <View
          style={[
            styles.iconContainer,
            { backgroundColor: bgColor },
            isRTL ? { marginLeft: 12, marginRight: 4 } : { marginLeft: 4, marginRight: 12 },
          ]}
        >
          <MaterialIcons
            name={isIncome ? 'check-circle' : 'trending-down'}
            size={22}
            color={accentColor}
          />
        </View>

        <View
          style={[
            styles.textContainer,
            isRTL ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' },
          ]}
        >
          <Text
            style={[
              styles.toastTitle,
              { color: colors.textPrimary },
              isRTL ? { textAlign: 'right' } : { textAlign: 'left' },
            ]}
          >
            {isIncome ? t('toastIncomeSuccess') : t('toastExpenseSuccess')}
          </Text>
          <View
            style={[
              styles.detailRow,
              isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' },
            ]}
          >
            <Text style={[styles.toastAmount, { color: accentColor }]}>
              {isIncome ? '+ ' : '- '}
              {amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
            </Text>
            <Text
              style={[styles.toastSubtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        </View>

        <View style={styles.actionIcon}>
          <MaterialIcons name="bolt" size={20} color={accentColor} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    overflow: 'hidden',
  },
  glowLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  toastAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  toastSubtitle: {
    fontSize: 12,
    color: '#64748B',
    maxWidth: 150,
  },
  actionIcon: {
    marginLeft: 8,
  },
});
