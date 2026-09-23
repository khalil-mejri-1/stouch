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
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTransactions } from '../context/TransactionsContext';
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

const CATEGORY_KEYS = ['food', 'transport', 'shopping', 'income', 'entertainment', 'bills', 'work', 'other'];

const CATEGORY_CONFIG: { [key: string]: { color: string } } = {
  food: { color: '#f97316' },
  transport: { color: '#60a5fa' },
  shopping: { color: '#ec4899' },
  income: { color: '#66d9cc' },
  entertainment: { color: '#A855F7' },
  bills: { color: '#eab308' },
  work: { color: '#3b82f6' },
  other: { color: '#9ca3af' },
};

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { t, isRTL, currency } = useLanguage();
  const { colors, isDark } = useTheme();

  const [txTitleInput, setTxTitleInput] = useState('');
  const [txAmountInput, setTxAmountInput] = useState('');
  const [txTypeSelect, setTxTypeSelect] = useState<'income' | 'expense'>('expense');
  const [txCategorySelect, setTxCategorySelect] = useState('food');

  const handleTypeSelect = (type: 'income' | 'expense') => {
    try {
      Haptics.selectionAsync();
    } catch {
      // safe fallback
    }
    setTxTypeSelect(type);
  };

  const handleSave = () => {
    if (!txTitleInput.trim() || !txAmountInput.trim() || isNaN(parseFloat(txAmountInput)) || parseFloat(txAmountInput) <= 0) {
      Alert.alert('', t('alertTxEmpty'));
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    addTransaction(txTitleInput.trim(), txAmountInput.trim(), txTypeSelect, txCategorySelect);
    router.back();
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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('addTransactionTitle')}</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard style={styles.formCard}>
            <Text style={[styles.inputLabel, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
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
              value={txTitleInput}
              onChangeText={setTxTitleInput}
            />

            <Text style={[styles.inputLabel, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
              {t('txAmountLabel')}
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
              value={txAmountInput}
              onChangeText={setTxAmountInput}
            />

            <Text style={[styles.inputLabel, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
              {t('txTypeLabel')}
            </Text>
            <View
              style={[
                styles.typeSelector,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              {/* Income (Revenus) Button */}
              <TouchableOpacity
                style={[
                  styles.typeCard,
                  {
                    backgroundColor:
                      txTypeSelect === 'income'
                        ? (isDark ? 'rgba(16, 185, 129, 0.16)' : '#ECFDF5')
                        : (isDark ? colors.surfaceSecondary : '#F8FAFC'),
                    borderColor:
                      txTypeSelect === 'income'
                        ? (isDark ? '#10B981' : '#059669')
                        : colors.border,
                    borderWidth: txTypeSelect === 'income' ? 1.5 : 1,
                  },
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
                onPress={() => handleTypeSelect('income')}
                activeOpacity={0.75}
              >
                <MaterialIcons
                  name="south-west"
                  size={18}
                  color={
                    txTypeSelect === 'income'
                      ? (isDark ? '#34D399' : '#059669')
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeCardText,
                    {
                      color:
                        txTypeSelect === 'income'
                          ? (isDark ? '#34D399' : '#059669')
                          : colors.textSecondary,
                      fontWeight: txTypeSelect === 'income' ? '700' : '600',
                    },
                  ]}
                >
                  {t('income')}
                </Text>
              </TouchableOpacity>

              {/* Expense (Dépenses) Button */}
              <TouchableOpacity
                style={[
                  styles.typeCard,
                  {
                    backgroundColor:
                      txTypeSelect === 'expense'
                        ? (isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2')
                        : (isDark ? colors.surfaceSecondary : '#F8FAFC'),
                    borderColor:
                      txTypeSelect === 'expense'
                        ? (isDark ? '#EF4444' : '#DC2626')
                        : colors.border,
                    borderWidth: txTypeSelect === 'expense' ? 1.5 : 1,
                  },
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
                onPress={() => handleTypeSelect('expense')}
                activeOpacity={0.75}
              >
                <MaterialIcons
                  name="north-east"
                  size={18}
                  color={
                    txTypeSelect === 'expense'
                      ? (isDark ? '#F87171' : '#DC2626')
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeCardText,
                    {
                      color:
                        txTypeSelect === 'expense'
                          ? (isDark ? '#F87171' : '#DC2626')
                          : colors.textSecondary,
                      fontWeight: txTypeSelect === 'expense' ? '700' : '600',
                    },
                  ]}
                >
                  {t('expenses')}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
              {t('txCategoryLabel')}
            </Text>
            <View style={[styles.categorySelectorGrid, !isRTL && { flexDirection: 'row' }]}>
              {CATEGORY_KEYS.map((catKey) => {
                const isSelected = txCategorySelect === catKey;
                const catColor = CATEGORY_CONFIG[catKey]?.color || '#9ca3af';
                const label = getCategoryLabel(catKey, t);

                return (
                  <TouchableOpacity
                    key={catKey}
                    style={[
                      styles.categorySelectBtn,
                      { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                      isSelected && {
                        backgroundColor: `${catColor}25`,
                        borderColor: catColor,
                      },
                    ]}
                    onPress={() => setTxCategorySelect(catKey)}
                  >
                    <Text
                      style={[
                        styles.categorySelectText,
                        { color: colors.textSecondary },
                        isSelected && { color: catColor, fontWeight: '700' },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.saveBtnGradient}
              >
                <Text style={styles.saveBtnText}>{t('saveTransactionBtn')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Voice assistant recording button at bottom */}
            <View style={styles.voiceAssistantSection}>
              <Text style={[styles.voiceSectionText, { color: colors.textSecondary }]}>{t('orAddWithVoice')}</Text>
              <TouchableOpacity
                style={styles.voiceMicBtn}
                onPress={() => {
                  router.push('/record');
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.voiceMicGradient}
                >
                  <MaterialIcons name="mic" size={28} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
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
  glassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formCard: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'right',
  },
  textInput: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    color: '#0F172A',
    textAlign: 'right',
    fontSize: 15,
  },
  typeSelector: {
    gap: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 8,
  },
  typeCardText: {
    fontSize: 14,
  },
  categorySelectorGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categorySelectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categorySelectText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 28,
  },
  saveBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  voiceAssistantSection: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  voiceSectionText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  voiceMicBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  voiceMicGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
