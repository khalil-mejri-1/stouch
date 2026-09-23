import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export interface CustomFilterItem {
  id: string;
  label: string;
  type: 'all' | 'expense' | 'income';
}

interface CustomFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onAddFilter: (filter: Omit<CustomFilterItem, 'id'>) => void;
}

export const CustomFilterModal: React.FC<CustomFilterModalProps> = ({
  visible,
  onClose,
  onAddFilter,
}) => {
  const { t, isRTL } = useLanguage();
  const { colors, isDark } = useTheme();
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'all' | 'expense' | 'income'>('all');

  const suggestions = isRTL
    ? ['قهوة', 'بنزين', 'صيدلية', 'مطعم', 'بقالة', 'اشتراك', 'راتب', 'تاكسي']
    : ['Café', 'Carburant', 'Pharmacie', 'Restaurant', 'Courses', 'Netflix', 'Salaire', 'Uber'];

  const handleSave = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      Alert.alert(
        isRTL ? 'تنبيه' : 'Attention',
        isRTL ? 'يرجى إدخال اسم أو كلمة دلالية للزر' : 'Veuillez saisir un nom ou un mot-clé pour le bouton'
      );
      return;
    }

    onAddFilter({
      label: trimmed,
      type,
    });

    setLabel('');
    setType('all');
    onClose();
  };

  const handleClose = () => {
    setLabel('');
    setType('all');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.modalOverlay,
          { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)' },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: colors.border },
              !isRTL && { flexDirection: 'row-reverse' },
            ]}
          >
            <TouchableOpacity
              onPress={handleClose}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.headerTitleWrap, !isRTL && { alignItems: 'flex-start' }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {t('customFilterModalTitle')}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                {t('customFilterModalSubtitle')}
              </Text>
            </View>

            <View style={{ width: 36 }} />
          </View>

          {/* Form Content */}
          <View style={styles.formBody}>
            {/* Filter Name / Keyword Input */}
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.textPrimary },
                !isRTL && { textAlign: 'left' },
              ]}
            >
              {t('customFilterNameLabel')}
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.searchBg, borderColor: colors.border },
              ]}
            >
              <MaterialIcons name="local-offer" size={18} color={colors.textSecondary} />
              <TextInput
                style={[
                  styles.textInput,
                  { color: colors.textPrimary },
                  !isRTL ? { textAlign: 'left' } : { textAlign: 'right' },
                ]}
                placeholder={t('customFilterPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={label}
                onChangeText={setLabel}
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              {label.length > 0 && (
                <TouchableOpacity onPress={() => setLabel('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Suggestions Chips */}
            <View style={[styles.suggestionsRow, !isRTL && { flexDirection: 'row' }]}>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.suggestionChip,
                    { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                    label === item && {
                      backgroundColor: isDark ? '#38BDF8' : '#0F172A',
                      borderColor: isDark ? '#38BDF8' : '#0F172A',
                    },
                  ]}
                  onPress={() => setLabel(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.suggestionChipText,
                      { color: colors.textSecondary },
                      label === item && {
                        color: isDark ? '#080C15' : '#FFFFFF',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Target Type Selector (All / Expenses / Income) */}
            <Text
              style={[
                styles.sectionLabel,
                { marginTop: 16, color: colors.textPrimary },
                !isRTL && { textAlign: 'left' },
              ]}
            >
              {t('customFilterTypeLabel')}
            </Text>
            <View style={[styles.typeRow, !isRTL && { flexDirection: 'row' }]}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  type === 'all' && {
                    backgroundColor: isDark ? '#38BDF8' : '#0F172A',
                    borderColor: isDark ? '#38BDF8' : '#0F172A',
                  },
                ]}
                onPress={() => setType('all')}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    { color: colors.textSecondary },
                    type === 'all' && {
                      color: isDark ? '#080C15' : '#FFFFFF',
                      fontWeight: '700',
                    },
                  ]}
                >
                  {t('all')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  type === 'expense' && {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                    borderColor: isDark ? 'rgba(248, 113, 113, 0.4)' : '#FECACA',
                  },
                ]}
                onPress={() => setType('expense')}
                activeOpacity={0.75}
              >
                <View style={[styles.typeDot, { backgroundColor: isDark ? '#F87171' : '#EF4444' }]} />
                <Text
                  style={[
                    styles.typeOptionText,
                    { color: colors.textSecondary },
                    type === 'expense' && {
                      color: isDark ? '#F87171' : '#DC2626',
                      fontWeight: '700',
                    },
                  ]}
                >
                  {t('expenses')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                  type === 'income' && {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
                    borderColor: isDark ? 'rgba(52, 211, 153, 0.4)' : '#A7F3D0',
                  },
                ]}
                onPress={() => setType('income')}
                activeOpacity={0.75}
              >
                <View style={[styles.typeDot, { backgroundColor: isDark ? '#34D399' : '#10B981' }]} />
                <Text
                  style={[
                    styles.typeOptionText,
                    { color: colors.textSecondary },
                    type === 'income' && {
                      color: isDark ? '#34D399' : '#059669',
                      fontWeight: '700',
                    },
                  ]}
                >
                  {t('income')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit & Cancel Actions */}
            <View style={[styles.actionsRow, !isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                ]}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtnWrap}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#A855F7', '#7C3AED']}
                  style={styles.submitBtn}
                >
                  <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>{t('customFilterCreateBtn')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'flex-end',
    flex: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  formBody: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  suggestionsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  suggestionChipText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
  },
  suggestionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  typeOptionActiveAll: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  typeOptionActiveExpense: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  typeOptionActiveIncome: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  submitBtnWrap: {
    flex: 1.5,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
