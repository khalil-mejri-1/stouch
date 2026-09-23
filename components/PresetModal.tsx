import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QuickPreset } from '../context/TransactionsContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface PresetModalProps {
  visible: boolean;
  presetToEdit?: QuickPreset | null;
  onClose: () => void;
  onSave: (data: Omit<QuickPreset, 'id'>) => void;
  onUpdate?: (id: string, data: Partial<QuickPreset>) => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES = [
  { id: 'دخل', label: 'دخل', icon: 'payments', defaultColor: '#66d9cc' },
  { id: 'طعام', label: 'طعام', icon: 'restaurant', defaultColor: '#f97316' },
  { id: 'نقل', label: 'نقل', icon: 'directions-car', defaultColor: '#60a5fa' },
  { id: 'تسوق', label: 'تسوق', icon: 'shopping-bag', defaultColor: '#ec4899' },
  { id: 'فواتير', label: 'فواتير', icon: 'receipt', defaultColor: '#eab308' },
  { id: 'عمل', label: 'عمل', icon: 'work', defaultColor: '#38bdf8' },
  { id: 'ترفيه', label: 'ترفيه', icon: 'movie', defaultColor: '#A855F7' },
  { id: 'أخرى', label: 'أخرى', icon: 'category', defaultColor: '#9ca3af' },
];

const AVAILABLE_ICONS = [
  'business-center',
  'payments',
  'account-balance-wallet',
  'work',
  'laptop',
  'local-cafe',
  'restaurant',
  'local-gas-station',
  'directions-car',
  'shopping-bag',
  'shopping-cart',
  'receipt',
  'phone-android',
  'home',
  'fitness-center',
  'trending-up',
];

const COLOR_PALETTES = [
  '#66d9cc', // Teal / Mint
  '#D4AF37', // Gold
  '#60a5fa', // Blue
  '#f97316', // Orange
  '#ef4444', // Red
  '#A855F7', // Purple
  '#ec4899', // Pink
  '#10B981', // Emerald Green
];

export const PresetModal: React.FC<PresetModalProps> = ({
  visible,
  presetToEdit,
  onClose,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const { t, currency } = useLanguage();
  const { colors, isDark } = useTheme();
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('دخل');
  const [icon, setIcon] = useState('business-center');
  const [color, setColor] = useState('#66d9cc');

  const categoriesList = [
    { id: 'دخل', label: t('catIncome'), icon: 'payments', defaultColor: '#66d9cc' },
    { id: 'طعام', label: t('catFood'), icon: 'restaurant', defaultColor: '#f97316' },
    { id: 'نقل', label: t('catTransport'), icon: 'directions-car', defaultColor: '#60a5fa' },
    { id: 'تسوق', label: t('catShopping'), icon: 'shopping-bag', defaultColor: '#ec4899' },
    { id: 'فواتير', label: t('catBills'), icon: 'receipt', defaultColor: '#eab308' },
    { id: 'عمل', label: t('catWork'), icon: 'work', defaultColor: '#38bdf8' },
    { id: 'ترفيه', label: t('catEntertainment'), icon: 'movie', defaultColor: '#A855F7' },
    { id: 'أخرى', label: t('catOther'), icon: 'category', defaultColor: '#9ca3af' },
  ];

  useEffect(() => {
    if (presetToEdit) {
      setType(presetToEdit.type);
      setTitle(presetToEdit.title);
      setAmount(presetToEdit.amount.toString());
      setCategory(presetToEdit.category);
      setIcon(presetToEdit.icon || 'business-center');
      setColor(presetToEdit.color || (presetToEdit.type === 'income' ? '#66d9cc' : '#ef4444'));
    } else {
      setType('income');
      setTitle('');
      setAmount('');
      setCategory('دخل');
      setIcon('business-center');
      setColor('#66d9cc');
    }
  }, [presetToEdit, visible]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    if (!presetToEdit) {
      if (newType === 'income') {
        setCategory('دخل');
        setIcon('business-center');
        setColor('#66d9cc');
      } else {
        setCategory('طعام');
        setIcon('restaurant');
        setColor('#f97316');
      }
    }
  };

  const handleCategorySelect = (catId: string) => {
    setCategory(catId);
    const cat = categoriesList.find(c => c.id === catId);
    if (cat) {
      setIcon(cat.icon);
      setColor(cat.defaultColor);
    }
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert(t('confirm'), t('alertTitleRequired'));
      return;
    }

    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(t('confirm'), t('alertAmountInvalid'));
      return;
    }

    if (presetToEdit && onUpdate) {
      onUpdate(presetToEdit.id, {
        title: trimmedTitle,
        amount: numericAmount,
        type,
        category,
        icon,
        color,
      });
    } else {
      onSave({
        title: trimmedTitle,
        amount: numericAmount,
        type,
        category,
        icon,
        color,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!presetToEdit || !onDelete) return;

    Alert.alert(
      t('deletePresetConfirmTitle'),
      `${t('deletePresetConfirmMsg')} "${presetToEdit.title}"?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => {
            onDelete(presetToEdit.id);
            onClose();
          },
        },
      ]
    );
  };

  const isEditing = !!presetToEdit;

  const incomeSuggestions = ['Technotech', t('catIncome'), t('catWork')];
  const expenseSuggestions = [t('catFood'), t('catTransport'), t('catShopping')];
  const quickAmounts = [2, 5, 9, 10, 20, 50, 100];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.modalOverlay,
          { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)' },
        ]}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.headerTitleWrap}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {isEditing ? t('modalEditPresetTitle') : t('modalAddPresetTitle')}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {isEditing ? t('modalEditPresetSubtitle') : t('modalAddPresetSubtitle')}
              </Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Type Switcher (Income vs Expense) */}
            <View style={[styles.typeSwitcher, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'income' && {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
                    borderColor: isDark ? 'rgba(52, 211, 153, 0.4)' : '#A7F3D0',
                    borderWidth: 1,
                  },
                ]}
                onPress={() => handleTypeChange('income')}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="south-west"
                  size={18}
                  color={type === 'income' ? (isDark ? '#34D399' : '#059669') : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: colors.textSecondary },
                    type === 'income' && { color: isDark ? '#34D399' : '#059669', fontWeight: '700' },
                  ]}
                >
                  {t('fixedIncomeTab')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeTab,
                  type === 'expense' && {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                    borderColor: isDark ? 'rgba(248, 113, 113, 0.4)' : '#FECACA',
                    borderWidth: 1,
                  },
                ]}
                onPress={() => handleTypeChange('expense')}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="north-east"
                  size={18}
                  color={type === 'expense' ? (isDark ? '#F87171' : '#DC2626') : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: colors.textSecondary },
                    type === 'expense' && { color: isDark ? '#F87171' : '#DC2626', fontWeight: '700' },
                  ]}
                >
                  {t('fixedExpenseTab')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title Input */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('presetNameLabel')}</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.searchBg, borderColor: colors.border, color: colors.textPrimary },
              ]}
              placeholder={type === 'income' ? t('presetNamePlaceholderIncome') : t('presetNamePlaceholderExpense')}
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Quick Suggestions Chips */}
            <View style={styles.chipsRow}>
              {(type === 'income' ? incomeSuggestions : expenseSuggestions).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    title === item && {
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                      borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : '#F59E0B',
                    },
                  ]}
                  onPress={() => setTitle(item)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.textSecondary },
                      title === item && { color: isDark ? '#FBBF24' : '#D97706', fontWeight: '700' },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount Input */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('presetAmountLabel')} ({currency})</Text>
            <View style={styles.amountInputRow}>
              <Text
                style={[
                  styles.currencyBadge,
                  {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A',
                    color: isDark ? '#FBBF24' : '#D97706',
                  },
                ]}
              >
                {currency}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.amountInput,
                  { backgroundColor: colors.searchBg, borderColor: colors.border, color: colors.textPrimary },
                ]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                textAlign="center"
              />
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.chipsRow}>
              {quickAmounts.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    amount === val.toString() && {
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
                      borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : '#F59E0B',
                    },
                  ]}
                  onPress={() => setAmount(val.toString())}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: colors.textSecondary },
                      amount === val.toString() && { color: isDark ? '#FBBF24' : '#D97706', fontWeight: '700' },
                    ]}
                  >
                    {val} {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Selector */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('presetCategoryLabel')}</Text>
            <View style={styles.categoriesGrid}>
              {categoriesList.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      isSelected && {
                        borderColor: cat.defaultColor,
                        backgroundColor: `${cat.defaultColor}25`,
                      },
                    ]}
                    onPress={() => handleCategorySelect(cat.id)}
                  >
                    <MaterialIcons
                      name={cat.icon as any}
                      size={20}
                      color={isSelected ? cat.defaultColor : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isSelected ? cat.defaultColor : colors.textSecondary },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Icon Picker */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('presetIconLabel')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.iconsRow}
            >
              {AVAILABLE_ICONS.map((icName) => {
                const isSelected = icon === icName;
                return (
                  <TouchableOpacity
                    key={icName}
                    style={[
                      styles.iconSelectBtn,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      isSelected && { borderColor: color, backgroundColor: `${color}25` },
                    ]}
                    onPress={() => setIcon(icName)}
                  >
                    <MaterialIcons
                      name={icName as any}
                      size={24}
                      color={isSelected ? color : colors.textSecondary}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Color Accent Picker */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('presetColorLabel')}</Text>
            <View style={styles.colorsRow}>
              {COLOR_PALETTES.map((c) => {
                const isSelected = color === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      isSelected && styles.colorDotSelected,
                    ]}
                    onPress={() => setColor(c)}
                  >
                    {isSelected && (
                      <MaterialIcons name="check" size={16} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live Preview of Button */}
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('presetPreviewLabel')}</Text>
            <View
              style={[
                styles.previewCard,
                {
                  borderColor: `${color}35`,
                  backgroundColor: colors.surfaceSecondary,
                },
              ]}
            >
              <View style={[styles.previewIconBox, { backgroundColor: `${color}25` }]}>
                <MaterialIcons name={icon as any} size={24} color={color} />
              </View>
              <View style={styles.previewInfo}>
                <Text style={[styles.previewTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {title || (type === 'income' ? t('presetNamePlaceholderIncome') : t('presetNamePlaceholderExpense'))}
                </Text>
                <Text style={[styles.previewCategory, { color: colors.textSecondary }]}>
                  {categoriesList.find(c => c.id === category)?.label || category}
                </Text>
              </View>
              <View style={[styles.previewBadge, { backgroundColor: `${color}25` }]}>
                <Text style={[styles.previewAmount, { color }]}>
                  {type === 'income' ? '+ ' : '- '}
                  {(parseFloat(amount) || 0).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  {currency}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: color }]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <MaterialIcons name="check" size={22} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {isEditing ? t('saveChangesBtn') : t('createPresetBtn')}
                </Text>
              </TouchableOpacity>

              {isEditing && onDelete && (
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    {
                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                      borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
                    },
                  ]}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="delete-outline" size={20} color={isDark ? '#F87171' : '#DC2626'} />
                  <Text style={[styles.deleteButtonText, { color: isDark ? '#F87171' : '#DC2626' }]}>
                    {t('deletePresetBtn')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: '88%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  typeTabActiveIncome: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  typeTabActiveExpense: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  typeTabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 14,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#0F172A',
    fontSize: 15,
  },
  chipsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  chipText: {
    fontSize: 12,
    color: '#64748B',
  },
  chipTextActive: {
    color: '#D97706',
    fontWeight: '700',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    color: '#D97706',
    fontWeight: '700',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#64748B',
  },
  iconsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingVertical: 4,
  },
  iconSelectBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
    paddingVertical: 4,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 2.5,
    borderColor: '#0F172A',
    transform: [{ scale: 1.15 }],
  },
  previewCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
  },
  previewIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  previewAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
    marginTop: 28,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
