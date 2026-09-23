import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLanguage, getCategoryLabel } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Transaction, formatTransactionAmount } from '../context/TransactionsContext';

interface DeleteTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: (tx: Transaction) => void;
}

const { width } = Dimensions.get('window');

export const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  visible,
  transaction,
  onClose,
  onConfirm,
}) => {
  const { t, isRTL, currency } = useLanguage();
  const { colors, isDark } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        // Safe fallback
      }

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Subtle pulse on the danger badge
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  if (!transaction) return null;

  const handleConfirm = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Safe fallback
    }
    onConfirm(transaction);
  };

  const handleClose = () => {
    try {
      Haptics.selectionAsync();
    } catch {
      // Safe fallback
    }
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const accentColor =
    transaction.iconColor ||
    (transaction.type === 'income'
      ? (isDark ? '#34D399' : '#059669')
      : (isDark ? '#F87171' : '#DC2626'));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View
        style={[
          styles.overlay,
          { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.78)' : 'rgba(15, 23, 42, 0.5)' },
        ]}
      >
        <Animated.View
          style={[
            styles.cardModal,
            {
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.28)' : '#FCA5A5',
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Danger Glowing Icon Header */}
          <View style={styles.iconCenterWrap}>
            <Animated.View
              style={[
                styles.pulseOuterRing,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.18)',
                },
              ]}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.iconInnerBadge}
              >
                <MaterialIcons name="delete-forever" size={32} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Modal Titles */}
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {t('deleteTxModalTitle')}
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            {t('deleteTxModalSubtitle')}
          </Text>

          {/* Preview Card of Transaction to be Deleted (Sleek minimalist style) */}
          <View
            style={[
              styles.previewContainer,
              {
                backgroundColor: isDark ? '#161F33' : '#F8FAFC',
                borderColor: colors.border,
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
              isRTL
                ? { borderRightWidth: 3.5, borderRightColor: accentColor }
                : { borderLeftWidth: 3.5, borderLeftColor: accentColor },
            ]}
          >
            <View
              style={[
                styles.previewInfo,
                isRTL ? { marginRight: 6, alignItems: 'flex-end' } : { marginLeft: 6, alignItems: 'flex-start' },
              ]}
            >
              <View style={[styles.previewTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View
                  style={[
                    styles.previewDot,
                    { backgroundColor: accentColor },
                    isRTL ? { marginLeft: 6 } : { marginRight: 6 },
                  ]}
                />
                <Text
                  style={[
                    styles.previewTitle,
                    { color: colors.textPrimary },
                    isRTL && { textAlign: 'right' },
                  ]}
                  numberOfLines={1}
                >
                  {transaction.title}
                </Text>
              </View>
              <Text
                style={[
                  styles.previewTime,
                  { color: colors.textSecondary },
                  isRTL ? { paddingRight: 12, textAlign: 'right' } : { paddingLeft: 12, textAlign: 'left' },
                ]}
              >
                {transaction.time}
              </Text>
            </View>

            <View style={[styles.previewAmountWrap, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
              <Text
                style={[
                  styles.previewAmount,
                  { color: transaction.type === 'income' ? colors.incomeText : colors.expenseText },
                ]}
              >
                {formatTransactionAmount(transaction, currency)}
              </Text>
              <View
                style={[
                  styles.previewTag,
                  {
                    backgroundColor:
                      transaction.type === 'income'
                        ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5')
                        : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2'),
                    borderColor:
                      transaction.type === 'income'
                        ? (isDark ? 'rgba(52, 211, 153, 0.35)' : '#A7F3D0')
                        : (isDark ? 'rgba(248, 113, 113, 0.35)' : '#FECACA'),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.previewTagText,
                    { color: transaction.type === 'income' ? colors.incomeText : colors.expenseText },
                  ]}
                >
                  {getCategoryLabel(transaction.tag, t)}
                </Text>
              </View>
            </View>
          </View>

          {/* Balance Recalculation Notice */}
          <View
            style={[
              styles.noticeBox,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2',
                borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FECACA',
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <MaterialIcons
              name="info-outline"
              size={16}
              color={isDark ? '#F87171' : '#EF4444'}
              style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }}
            />
            <Text
              style={[
                styles.noticeText,
                { color: isDark ? '#FCA5A5' : '#DC2626' },
                isRTL && { textAlign: 'right' },
              ]}
            >
              {t('deleteTxBalanceNotice')}
            </Text>
          </View>

          {/* Action Buttons: Cancel vs Confirm */}
          <View style={[styles.actionsRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
              onPress={handleClose}
              activeOpacity={0.75}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                {t('cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmBtnWrap}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.confirmBtn, isRTL && { flexDirection: 'row-reverse' }]}
              >
                <MaterialIcons name="delete-outline" size={19} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>{t('deleteTxConfirmBtn')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  cardModal: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 28,
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 20,
  },
  iconCenterWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseOuterRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  previewContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  previewTitleRow: {
    alignItems: 'center',
    marginBottom: 2,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  previewTime: {
    fontSize: 11,
  },
  previewAmountWrap: {
    justifyContent: 'center',
  },
  previewAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  previewTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
  },
  previewTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  noticeBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtnWrap: {
    flex: 1.4,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
