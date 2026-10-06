import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Transaction } from '../context/TransactionsContext';
import { useLanguage, getCategoryLabel } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface EditTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (
    id: string,
    updatedData: {
      title: string;
      numericAmount: number;
      type: 'income' | 'expense';
      tag: string;
      status?: 'received' | 'pending';
    }
  ) => void;
  onDelete?: (tx: Transaction) => void;
}

const { width } = Dimensions.get('window');

const CATEGORY_KEYS = ['income', 'work', 'food', 'transport', 'shopping', 'bills', 'entertainment', 'other'];

const CATEGORY_CONFIG: { [key: string]: { icon: string; color: string } } = {
  income: { icon: 'payments', color: '#10B981' },
  work: { icon: 'business-center', color: '#3B82F6' },
  food: { icon: 'restaurant', color: '#F97316' },
  transport: { icon: 'directions-car', color: '#60A5FA' },
  shopping: { icon: 'shopping-bag', color: '#EC4899' },
  bills: { icon: 'receipt', color: '#EAB308' },
  entertainment: { icon: 'movie', color: '#A855F7' },
  other: { icon: 'category', color: '#9CA3AF' },
};

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  visible,
  transaction,
  onClose,
  onSave,
  onDelete,
}) => {
  const { t, isRTL, currency } = useLanguage();
  const { colors, isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [status, setStatus] = useState<'received' | 'pending'>('received');
  const [tag, setTag] = useState('دخل');

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title || '');
      setAmount(transaction.numericAmount != null ? transaction.numericAmount.toString() : '');
      setType(transaction.type);
      setStatus(transaction.status || 'received');
      setTag(transaction.tag || (transaction.type === 'income' ? 'دخل' : 'طعام'));
    }
  }, [transaction]);

  useEffect(() => {
    if (visible) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}

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
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!transaction) return null;

  const handleTypeSelect = (newType: 'income' | 'expense') => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setType(newType);
    if (newType === 'income' && !status) {
      setStatus('received');
    }
  };

  const handleStatusSelect = (newStatus: 'received' | 'pending') => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setStatus(newStatus);
  };

  const handleQuickReceive = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setStatus('received');
  };

  const handleSave = () => {
    const num = parseFloat(amount);
    if (!title.trim() || isNaN(num) || num <= 0) {
      Alert.alert('', t('alertTxEmpty'));
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    onSave(transaction.id, {
      title: title.trim(),
      numericAmount: num,
      type,
      tag,
      status: type === 'income' ? status : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(transaction);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header Row */}
          <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.titleWithIcon}>
              <View
                style={[
                  styles.headerIconBox,
                  {
                    backgroundColor:
                      type === 'income'
                        ? (status === 'pending'
                            ? (isDark ? 'rgba(245, 158, 11, 0.22)' : '#FEF9C3')
                            : (isDark ? 'rgba(16, 185, 129, 0.22)' : '#ECFDF5'))
                        : (isDark ? 'rgba(239, 68, 68, 0.22)' : '#FEF2F2'),
                    borderColor:
                      type === 'income'
                        ? (status === 'pending'
                            ? (isDark ? 'rgba(245, 158, 11, 0.45)' : '#FDE68A')
                            : (isDark ? 'rgba(52, 211, 153, 0.45)' : '#A7F3D0'))
                        : (isDark ? 'rgba(248, 113, 113, 0.45)' : '#FECACA'),
                  },
                ]}
              >
                <MaterialIcons
                  name={type === 'income' ? (status === 'pending' ? 'hourglass-empty' : 'payments') : 'receipt'}
                  size={20}
                  color={
                    type === 'income'
                      ? (status === 'pending'
                          ? (isDark ? '#FBBF24' : '#D97706')
                          : (isDark ? '#34D399' : '#059669'))
                      : (isDark ? '#F87171' : '#DC2626')
                  }
                />
              </View>
              <View style={[styles.headerTextWrap, !isRTL && { alignItems: 'flex-start' }]}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {type === 'income' ? t('editIncomeModalTitle', 'تعديل المدخول') : t('editTxModalTitle', 'تعديل العملية')}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {t('editTransactionSubtitle', 'يمكنك تعديل المبلغ، الحالة والتفاصيل وحفظها')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Title / Description Input */}
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
              {t('txNameLabel')}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.searchBg, borderColor: colors.border, color: colors.textPrimary },
                !isRTL && { textAlign: 'left' },
              ]}
              placeholder={t('txNamePlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Amount Input */}
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
              {t('txAmountLabel')} ({currency})
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.searchBg, borderColor: colors.border, color: colors.textPrimary },
                !isRTL && { textAlign: 'left' },
              ]}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Type Selector (Income vs Expense) */}
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
              {t('txTypeLabel')}
            </Text>
            <View style={[styles.typeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {/* Income */}
              <TouchableOpacity
                style={[
                  styles.typeCard,
                  {
                    backgroundColor:
                      type === 'income'
                        ? (isDark ? 'rgba(16, 185, 129, 0.16)' : '#ECFDF5')
                        : (isDark ? colors.surfaceSecondary : '#F8FAFC'),
                    borderColor:
                      type === 'income'
                        ? (isDark ? '#10B981' : '#059669')
                        : colors.border,
                    borderWidth: type === 'income' ? 1.5 : 1,
                  },
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
                onPress={() => handleTypeSelect('income')}
                activeOpacity={0.75}
              >
                <MaterialIcons
                  name="south-west"
                  size={18}
                  color={type === 'income' ? (isDark ? '#34D399' : '#059669') : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeCardText,
                    {
                      color: type === 'income' ? (isDark ? '#34D399' : '#059669') : colors.textSecondary,
                      fontWeight: type === 'income' ? '700' : '600',
                    },
                  ]}
                >
                  {t('income')}
                </Text>
              </TouchableOpacity>

              {/* Expense */}
              <TouchableOpacity
                style={[
                  styles.typeCard,
                  {
                    backgroundColor:
                      type === 'expense'
                        ? (isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2')
                        : (isDark ? colors.surfaceSecondary : '#F8FAFC'),
                    borderColor:
                      type === 'expense'
                        ? (isDark ? '#EF4444' : '#DC2626')
                        : colors.border,
                    borderWidth: type === 'expense' ? 1.5 : 1,
                  },
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
                onPress={() => handleTypeSelect('expense')}
                activeOpacity={0.75}
              >
                <MaterialIcons
                  name="north-east"
                  size={18}
                  color={type === 'expense' ? (isDark ? '#F87171' : '#DC2626') : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeCardText,
                    {
                      color: type === 'expense' ? (isDark ? '#F87171' : '#DC2626') : colors.textSecondary,
                      fontWeight: type === 'expense' ? '700' : '600',
                    },
                  ]}
                >
                  {t('expenses')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Receipt Status Selector (Only for Income) */}
            {type === 'income' && (
              <View style={styles.statusSectionContainer}>
                <View style={[styles.statusHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textPrimary, marginTop: 0, marginBottom: 0 }]}>
                    {t('receiptStatus')}
                  </Text>
                  <Text style={[styles.statusSubtitleText, { color: colors.textSecondary }]}>
                    {t('receiptStatusQuestion')}
                  </Text>
                </View>

                <View style={[styles.statusRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {/* Received */}
                  <TouchableOpacity
                    style={[
                      styles.statusCard,
                      {
                        backgroundColor:
                          status === 'received'
                            ? (isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5')
                            : (isDark ? colors.surfaceSecondary : '#F8FAFC'),
                        borderColor:
                          status === 'received'
                            ? (isDark ? '#10B981' : '#059669')
                            : colors.border,
                        borderWidth: status === 'received' ? 1.5 : 1,
                      },
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                    onPress={() => handleStatusSelect('received')}
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name="check-circle"
                      size={18}
                      color={status === 'received' ? (isDark ? '#34D399' : '#059669') : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.statusCardText,
                        {
                          color: status === 'received' ? (isDark ? '#34D399' : '#059669') : colors.textSecondary,
                          fontWeight: status === 'received' ? '700' : '600',
                        },
                      ]}
                    >
                      {t('receivedStatus')}
                    </Text>
                  </TouchableOpacity>

                  {/* Pending (Yellow Card Style) */}
                  <TouchableOpacity
                    style={[
                      styles.statusCard,
                      {
                        backgroundColor:
                          status === 'pending'
                            ? (isDark ? 'rgba(245, 158, 11, 0.20)' : '#FEF9C3')
                            : (isDark ? colors.surfaceSecondary : '#F8FAFC'),
                        borderColor:
                          status === 'pending'
                            ? (isDark ? '#F59E0B' : '#EAB308')
                            : colors.border,
                        borderWidth: status === 'pending' ? 1.5 : 1,
                      },
                      { flexDirection: isRTL ? 'row-reverse' : 'row' },
                    ]}
                    onPress={() => handleStatusSelect('pending')}
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name="hourglass-empty"
                      size={18}
                      color={status === 'pending' ? (isDark ? '#FBBF24' : '#D97706') : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.statusCardText,
                        {
                          color: status === 'pending' ? (isDark ? '#FBBF24' : '#B45309') : colors.textSecondary,
                          fontWeight: status === 'pending' ? '700' : '600',
                        },
                      ]}
                    >
                      {t('pendingStatus')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* If currently pending, show quick button to mark as received and yellow notice */}
                {status === 'pending' ? (
                  <View style={styles.pendingActionsBlock}>
                    <TouchableOpacity
                      style={styles.quickReceiveBtn}
                      onPress={handleQuickReceive}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={[styles.quickReceiveGradient, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                      >
                        <MaterialIcons name="done-all" size={17} color="#ffffff" />
                        <Text style={styles.quickReceiveText}>
                          {t('markAsReceived')}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <View
                      style={[
                        styles.pendingNoticeBanner,
                        {
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
                          borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
                        },
                      ]}
                    >
                      <MaterialIcons name="wb-sunny" size={15} color={isDark ? '#FBBF24' : '#D97706'} />
                      <Text style={[styles.pendingNoticeText, { color: isDark ? '#FDE68A' : '#92400E' }]}>
                        {t('pendingHint')}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.receivedNoticeBanner,
                      {
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
                        borderColor: isDark ? 'rgba(16, 185, 129, 0.28)' : '#A7F3D0',
                      },
                    ]}
                  >
                    <MaterialIcons name="check-circle" size={15} color={isDark ? '#34D399' : '#059669'} />
                    <Text style={[styles.receivedNoticeText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
                      {t('receivedConfirmedToast')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Category Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
              {t('txCategoryLabel')}
            </Text>
            <View style={[styles.categoryGrid, !isRTL && { flexDirection: 'row' }]}>
              {CATEGORY_KEYS.map((catKey) => {
                const label = getCategoryLabel(catKey, t);
                const isSelected = tag === catKey || tag === label;
                const config = CATEGORY_CONFIG[catKey] || { icon: 'category', color: '#9CA3AF' };

                return (
                  <TouchableOpacity
                    key={catKey}
                    style={[
                      styles.categoryBtn,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      isSelected && {
                        backgroundColor: `${config.color}25`,
                        borderColor: config.color,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() => {
                      try { Haptics.selectionAsync(); } catch {}
                      setTag(catKey);
                    }}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={config.icon as any}
                      size={15}
                      color={isSelected ? config.color : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryBtnText,
                        { color: colors.textSecondary },
                        isSelected && { color: config.color, fontWeight: '700' },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons: Save & Delete */}
            <View style={styles.actionButtonsCol}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.saveBtnGradient}
                >
                  <Text style={styles.saveBtnText}>{t('saveChanges', 'حفظ التعديلات')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              {onDelete && (
                <TouchableOpacity
                  style={[
                    styles.deleteBtn,
                    {
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEF2F2',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
                    },
                  ]}
                  onPress={handleDelete}
                  activeOpacity={0.75}
                >
                  <MaterialIcons name="delete-outline" size={18} color={isDark ? '#F87171' : '#DC2626'} />
                  <Text style={[styles.deleteBtnText, { color: isDark ? '#F87171' : '#DC2626' }]}>
                    {t('deleteTxModalTitle', 'حذف المعاملة')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
    zIndex: 10,
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.15)',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollBody: {
    paddingTop: 14,
    paddingBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'right',
  },
  textInput: {
    width: '100%',
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    textAlign: 'right',
  },
  typeRow: {
    gap: 10,
    marginTop: 4,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 7,
  },
  typeCardText: {
    fontSize: 13,
  },
  statusSectionContainer: {
    marginTop: 14,
    marginBottom: 2,
    gap: 8,
  },
  statusHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSubtitleText: {
    fontSize: 11.5,
  },
  statusRow: {
    gap: 10,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 13,
    gap: 7,
  },
  statusCardText: {
    fontSize: 13,
  },
  pendingActionsBlock: {
    marginTop: 6,
    gap: 8,
  },
  quickReceiveBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickReceiveGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 6,
  },
  quickReceiveText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  pendingNoticeBanner: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  pendingNoticeText: {
    fontSize: 11.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  receivedNoticeBanner: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  receivedNoticeText: {
    fontSize: 11.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  categoryGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 4,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 11,
    borderWidth: 1,
  },
  categoryBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  actionButtonsCol: {
    marginTop: 20,
    gap: 10,
  },
  saveBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
});
