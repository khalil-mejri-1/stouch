import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTransactions, QuickPreset, formatTransactionTime, Transaction } from '../../context/TransactionsContext';
import { useLanguage, getCategoryLabel } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { QuickPresetsSection } from '../../components/QuickPresetsSection';
import { PresetModal } from '../../components/PresetModal';
import { QuickToast } from '../../components/QuickToast';
import { LanguageModal } from '../../components/LanguageModal';
import { CustomFilterModal, CustomFilterItem } from '../../components/CustomFilterModal';
import { DeleteTransactionModal } from '../../components/DeleteTransactionModal';
import { AnimatedTransactionCard } from '../../components/AnimatedTransactionCard';
import { CalculationModal } from '../../components/CalculationModal';

const { width } = Dimensions.get('window');

// Custom glassmorphic card component
const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.glassCard, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const {
    transactions,
    getBalance,
    deleteTransaction,
    addPreset,
    updatePreset,
    deletePreset,
    triggerPreset,
    lastAddedTx,
    clearLastAddedTx,
  } = useTransactions();

  const scrollViewRef = useRef<ScrollView>(null);

  const { t, language, isRTL, currency } = useLanguage();
  const { theme, isDark, toggleTheme, colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<QuickPreset | null>(null);
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    title: string;
    amount: number;
    type: 'income' | 'expense';
  }>({
    visible: false,
    title: '',
    amount: 0,
    type: 'income',
  });

  // Search & Filter State for Activité section
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'income' | 'expense' | string>('all');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [customFilters, setCustomFilters] = useState<CustomFilterItem[]>([]);
  const [customFilterModalVisible, setCustomFilterModalVisible] = useState(false);
  const [hiddenFilters, setHiddenFilters] = useState<string[]>([]);

  // Calculation & Multi-Select State for Activité
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [calcModalVisible, setCalcModalVisible] = useState(false);
  const [calcModalData, setCalcModalData] = useState<{
    title: string;
    subtitle?: string;
    incomeTotal: number;
    expenseTotal: number;
    netTotal: number;
    incomeCount: number;
    expenseCount: number;
  }>({
    title: '',
    subtitle: '',
    incomeTotal: 0,
    expenseTotal: 0,
    netTotal: 0,
    incomeCount: 0,
    expenseCount: 0,
  });

  // Creative & Smooth Deletion State
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [deleteToastVisible, setDeleteToastVisible] = useState(false);
  const deleteToastY = useRef(new Animated.Value(-80)).current;
  const deleteToastOpacity = useRef(new Animated.Value(0)).current;

  const showDeleteSuccessToast = () => {
    setDeleteToastVisible(true);
    Animated.parallel([
      Animated.spring(deleteToastY, {
        toValue: 0,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(deleteToastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(deleteToastY, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(deleteToastOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDeleteToastVisible(false);
      });
    }, 2500);
  };

  const handleRequestDelete = (tx: Transaction) => {
    setTxToDelete(tx);
  };

  const handleConfirmDelete = (tx: Transaction) => {
    setTxToDelete(null);
    setDeletingTxId(tx.id);
  };

  const handleCardAnimationComplete = (id: string) => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    deleteTransaction(id);
    setDeletingTxId(null);
    showDeleteSuccessToast();
  };

  // Load custom filters and hidden category filters from storage on mount
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [savedCustom, savedHidden] = await Promise.all([
          AsyncStorage.getItem('@stouch_custom_filters'),
          AsyncStorage.getItem('@stouch_hidden_category_filters'),
        ]);
        if (savedCustom) {
          setCustomFilters(JSON.parse(savedCustom));
        }
        if (savedHidden) {
          setHiddenFilters(JSON.parse(savedHidden));
        }
      } catch (e) {
        console.error('Error loading filters data:', e);
      }
    };
    loadFiltersData();
  }, []);

  // Add custom filter button handler
  const handleAddCustomFilter = async (data: Omit<CustomFilterItem, 'id'>) => {
    const newFilter: CustomFilterItem = {
      id: `custom-${Date.now()}`,
      ...data,
    };
    const updated = [...customFilters, newFilter];
    setCustomFilters(updated);
    setActiveFilter(newFilter.id);
    try {
      await AsyncStorage.setItem('@stouch_custom_filters', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving custom filter:', e);
    }
  };

  // Delete custom filter button handler
  const handleDeleteCustomFilter = (id: string) => {
    Alert.alert(
      t('deleteCustomFilterTitle'),
      t('deleteCustomFilterMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: isRTL ? 'حذف' : 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updated = customFilters.filter((f) => f.id !== id);
            setCustomFilters(updated);
            if (activeFilter === id) {
              setActiveFilter('all');
            }
            try {
              await AsyncStorage.setItem('@stouch_custom_filters', JSON.stringify(updated));
            } catch (e) {
              console.error('Error saving custom filters:', e);
            }
          },
        },
      ]
    );
  };

  // Delete standard / preset category or type filter
  const handleDeleteDefaultFilter = (filterKey: string, label: string) => {
    Alert.alert(
      t('deleteFilterTitle'),
      `${t('deleteFilterMessage')}\n(« ${label} »)`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: isRTL ? 'حذف' : 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            const updated = [...hiddenFilters, filterKey];
            setHiddenFilters(updated);
            if (activeFilter === filterKey) {
              setActiveFilter('all');
            }
            try {
              await AsyncStorage.setItem('@stouch_hidden_category_filters', JSON.stringify(updated));
            } catch (e) {
              console.error('Error saving hidden filters:', e);
            }
          },
        },
      ]
    );
  };

  // Restore hidden default filters
  const handleResetHiddenFilters = () => {
    Alert.alert(
      t('restoreFilters'),
      t('restoreFiltersConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: isRTL ? 'استعادة' : (language === 'fr' ? 'Restaurer' : 'Restore'),
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            setHiddenFilters([]);
            try {
              await AsyncStorage.removeItem('@stouch_hidden_category_filters');
            } catch (e) {
              console.error('Error clearing hidden filters:', e);
            }
          },
        },
      ]
    );
  };

  // Toggle selection for a transaction
  const toggleSelectTx = (tx: Transaction) => {
    setSelectedTxIds((prev) =>
      prev.includes(tx.id) ? prev.filter((id) => id !== tx.id) : [...prev, tx.id]
    );
  };

  // Select all currently visible / filtered transactions
  const selectAllTransactions = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedTxIds(filteredTransactions.map((tx) => tx.id));
  };

  // Deselect all transactions
  const deselectAllTransactions = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedTxIds([]);
  };

  // Toggle multi-select mode
  const handleToggleSelectMode = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    if (isSelectMode) {
      setIsSelectMode(false);
      setSelectedTxIds([]);
    } else {
      setIsSelectMode(true);
    }
  };

  // Calculate selected transactions (Feature 1)
  const handleCalculateSelected = () => {
    if (selectedTxIds.length === 0) {
      Alert.alert(
        t('calculate', 'CALCUL'),
        t('noSelectionToCalculate', 'Veuillez sélectionner au moins une transaction')
      );
      return;
    }

    const selectedTxs = transactions.filter((tx) => selectedTxIds.includes(tx.id));
    let income = 0;
    let expense = 0;
    let incCount = 0;
    let expCount = 0;

    selectedTxs.forEach((tx) => {
      const amount = tx.numericAmount != null ? tx.numericAmount : 0;
      if (tx.type === 'income') {
        income += amount;
        incCount += 1;
      } else {
        expense += amount;
        expCount += 1;
      }
    });

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setCalcModalData({
      title: t('calculationTitle', 'Bilan du Calcul'),
      subtitle: `${selectedTxs.length} ${t('itemsCount', 'opération(s)')} ${t('selectedItems', 'sélectionnée(s)')}`,
      incomeTotal: income,
      expenseTotal: expense,
      netTotal: income - expense,
      incomeCount: incCount,
      expenseCount: expCount,
    });
    setCalcModalVisible(true);
  };

  // Calculate filtered transactions (Feature 2)
  const handleCalculateFiltered = () => {
    if (filteredTransactions.length === 0) {
      return;
    }

    let income = 0;
    let expense = 0;
    let incCount = 0;
    let expCount = 0;

    filteredTransactions.forEach((tx) => {
      const amount = tx.numericAmount != null ? tx.numericAmount : 0;
      if (tx.type === 'income') {
        income += amount;
        incCount += 1;
      } else {
        expense += amount;
        expCount += 1;
      }
    });

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    let filterLabel = '';
    if (activeFilter === 'expense') {
      filterLabel = t('expenses');
    } else if (activeFilter === 'income') {
      filterLabel = t('income');
    } else if (activeFilter !== 'all') {
      const custom = customFilters.find((f) => f.id === activeFilter);
      filterLabel = custom ? custom.label : getCategoryLabel(activeFilter, t);
    }
    if (searchQuery.trim()) {
      filterLabel = filterLabel ? `${filterLabel} • "${searchQuery}"` : `"${searchQuery}"`;
    }

    setCalcModalData({
      title: t('filterCalculationTitle', 'Total du Filtre'),
      subtitle: filterLabel
        ? `${filterLabel} (${filteredTransactions.length})`
        : `${filteredTransactions.length} ${t('itemsCount', 'opération(s)')}`,
      incomeTotal: income,
      expenseTotal: expense,
      netTotal: income - expense,
      incomeCount: incCount,
      expenseCount: expCount,
    });
    setCalcModalVisible(true);
  };

  // Fluid Creative Animation when a new Activity (Transaction) is added
  useEffect(() => {
    if (lastAddedTx) {
      // 1. Smooth LayoutAnimation for existing list items to glide down
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // 2. Smoothly scroll to top so user sees the newly added transaction card
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });

      // 3. Trigger celebratory haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      // 4. Pop up celebratory QuickToast
      setToastConfig({
        visible: true,
        title: lastAddedTx.title,
        amount: lastAddedTx.numericAmount,
        type: lastAddedTx.type,
      });

      // 5. Clear reference after celebration finishes
      const timer = setTimeout(() => {
        clearLastAddedTx();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [lastAddedTx]);

  const handleTriggerPreset = (preset: QuickPreset) => {
    triggerPreset(preset);
  };

  const handleOpenAddModal = () => {
    setPresetToEdit(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (preset: QuickPreset) => {
    setPresetToEdit(preset);
    setModalVisible(true);
  };

  // Format balance helper
  const balance = getBalance();
  const balanceFormatted = balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 });

  // Dynamic VIP Wallet Card Palette:
  // Dark Mode: Royal Obsidian & 24K Liquid Gold
  // Light Mode: Imperial Royal Sapphire & 24K Liquid Gold (Majestic deep navy/sapphire providing stunning contrast on white canvas)
  const cardGradient: [string, string, ...string[]] = isDark
    ? ['#0D1527', '#18243C', '#080E1B']
    : ['#0A1931', '#152C5B', '#071224'];

  // Filtered transactions helper based on search query & ready/custom filter buttons
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Ready button or Custom filter
    if (activeFilter === 'income' && tx.type !== 'income') return false;
    if (activeFilter === 'expense' && tx.type !== 'expense') return false;
    if (activeFilter !== 'all' && activeFilter !== 'income' && activeFilter !== 'expense') {
      const custom = customFilters.find((f) => f.id === activeFilter);
      if (custom) {
        if (custom.type === 'expense' && tx.type !== 'expense') return false;
        if (custom.type === 'income' && tx.type !== 'income') return false;
        const kw = custom.label.toLowerCase().trim();
        const titleMatch = tx.title.toLowerCase().includes(kw);
        const tagMatch = tx.tag.toLowerCase().includes(kw);
        const catLabel = getCategoryLabel(tx.tag, t).toLowerCase();
        const catMatch = catLabel.includes(kw);
        if (!titleMatch && !tagMatch && !catMatch) return false;
      } else {
        if (tx.tag !== activeFilter) return false;
      }
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = tx.title.toLowerCase().includes(q);
      const tagMatch = tx.tag.toLowerCase().includes(q);
      const catLabel = getCategoryLabel(tx.tag, t).toLowerCase();
      const catMatch = catLabel.includes(q);
      const amountMatch = tx.amount.toLowerCase().includes(q);
      const timeMatch = tx.time.toLowerCase().includes(q);
      return titleMatch || tagMatch || catMatch || amountMatch || timeMatch;
    }

    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Row with Language Switcher and Theme Toggle Button */}
        <View style={[styles.topHeader, !isRTL && { flexDirection: 'row-reverse' }]}>
          {/* Language Switcher Pill */}
          <TouchableOpacity
            style={[styles.languagePill, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setLangModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDark ? ['#1E293B', '#111827'] : ['#FFFFFF', '#F8FAFC']}
              style={styles.languagePillGradient}
            >
              <MaterialIcons name="language" size={17} color={isDark ? '#2DD4BF' : '#0D9488'} />
              <Text style={[styles.languagePillText, { color: colors.textPrimary }]}>
                {language === 'ar' ? 'العربية' : language === 'fr' ? 'Français' : 'English'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={16} color={colors.textSecondary} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Theme Mode Toggle Button (🌙 / ☀️) */}
          <TouchableOpacity
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isDark ? 'nightlight-round' : 'wb-sunny'}
              size={18}
              color={isDark ? '#FBBF24' : '#F59E0B'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bespoke Luxury VIP Card (Dual-Mode Edition) */}
          <LinearGradient
            colors={cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.balanceCard,
              {
                borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.45)',
              },
            ]}
          >
            {/* Ambient Geometric Decorative Rings with Dual-Mode Sheen */}
            <View
              style={[
                styles.cardDecorCircle,
                isRTL ? { left: -35 } : { right: -35 },
                { borderColor: isDark ? 'rgba(245, 158, 11, 0.07)' : 'rgba(245, 158, 11, 0.10)' },
              ]}
            />
            <View
              style={[
                styles.cardDecorCircleInner,
                isRTL ? { left: 15 } : { right: 15 },
                {
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.04)' : 'rgba(245, 158, 11, 0.06)',
                  borderColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
                },
              ]}
            />

            {/* Top Card Row: Chip / Contactless on one side, Wallet status on the other */}
            <View style={[styles.cardTopRow, !isRTL && { flexDirection: 'row-reverse' }]}>
              {/* Card Chip & Contactless symbol */}
              <View
                style={[
                  styles.cardChipGroup,
                  {
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.15)',
                    borderColor: isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.38)',
                  },
                  !isRTL && { flexDirection: 'row-reverse' },
                ]}
              >
                <MaterialCommunityIcons
                  name="integrated-circuit-chip"
                  size={28}
                  color="#FBBF24"
                />
                <MaterialCommunityIcons
                  name="contactless-payment"
                  size={22}
                  color="rgba(251, 191, 36, 0.85)"
                />
              </View>

              {/* Wallet Type & Title */}
              <View style={[styles.cardLabelWrap, !isRTL && { alignItems: 'flex-start' }]}>
                <View
                  style={[
                    styles.cardTypePill,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.12)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.22)',
                    },
                    !isRTL && { flexDirection: 'row-reverse' },
                  ]}
                >
                  <View style={[styles.activeDot, { backgroundColor: '#34D399' }]} />
                  <Text style={[styles.cardTypeText, { color: '#FFFFFF' }]}>
                    {t('mainWallet')}
                  </Text>
                </View>
                <Text style={[styles.balanceTitle, { color: isDark ? '#94A3B8' : '#93C5FD' }]}>
                  {t('totalBalance')}
                </Text>
              </View>
            </View>

            {/* Bottom Card Row: Large Balance Amount vs Brand Name */}
            <View style={[styles.cardBottomRow, !isRTL && { flexDirection: 'row-reverse' }]}>
              {/* Brand Watermark */}
              <View style={[styles.cardBrandWrap, !isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.cardBrandName, { color: '#FBBF24' }]}>
                  {t('appTitle')}
                </Text>
                <Text
                  style={[
                    styles.cardBrandSub,
                    { color: isDark ? 'rgba(251, 191, 36, 0.72)' : 'rgba(251, 191, 36, 0.80)' },
                  ]}
                >
                  PREMIUM WALLET
                </Text>
              </View>

              {/* Big Balance Amount & Currency Badge */}
              <View style={[styles.balanceAmountWrap, !isRTL && { alignItems: 'flex-start' }]}>
                <View style={[styles.balanceRow, !isRTL && { flexDirection: 'row' }]}>
                  {isRTL ? (
                    <>
                      <View
                        style={[
                          styles.currencyBadge,
                          {
                            backgroundColor: 'rgba(245, 158, 11, 0.20)',
                            borderColor: 'rgba(245, 158, 11, 0.45)',
                          },
                        ]}
                      >
                        <Text style={[styles.currencyBadgeText, { color: '#FBBF24' }]}>
                          {currency}
                        </Text>
                      </View>
                      <Text style={[styles.balanceAmount, { color: '#FFFFFF' }]}>
                        {balanceFormatted}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.balanceAmount, { color: '#FFFFFF' }]}>
                        {balanceFormatted}
                      </Text>
                      <View
                        style={[
                          styles.currencyBadge,
                          {
                            marginLeft: 8,
                            backgroundColor: 'rgba(245, 158, 11, 0.20)',
                            borderColor: 'rgba(245, 158, 11, 0.45)',
                          },
                        ]}
                      >
                        <Text style={[styles.currencyBadgeText, { color: '#FBBF24' }]}>
                          {currency}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Action Presets Section (مداخيل ومصاريف سريعة ثابته) */}
          <QuickPresetsSection
            onTriggerPreset={handleTriggerPreset}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
          />

          {/* Recent Activity Section Card (القسم كامل في كارد أبيض بأطراف دائرية ودون ظل أو إطار) */}
          <View
            style={[
              styles.activityCardContainer,
              {
                backgroundColor: isDark ? colors.surface : '#FFFFFF',
              },
            ]}
          >
            {/* Recent Activity Section Header & Search Toolbar */}
            <View style={styles.activityHeaderSection}>
              {/* Row 1: Section Title with Counter & Filter Tune / Calculator Buttons */}
              <View style={[styles.activityHeaderRow, !isRTL && { flexDirection: 'row-reverse' }]}>
                {/* Actions Group: Filter Tune & Multi-Select Calculator */}
                <View style={[styles.headerActionsGroup, !isRTL && { flexDirection: 'row' }]}>
                  {/* Filter Tune Toggle Button */}
                  <TouchableOpacity
                    style={[
                      styles.filterToggleBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
                      },
                      (showFilterBar || activeFilter !== 'all') && {
                        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.18)' : '#FAF5FF',
                        borderColor: isDark ? 'rgba(192, 132, 252, 0.5)' : '#DDD6FE',
                      },
                    ]}
                    onPress={() => setShowFilterBar((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="tune"
                      size={18}
                      color={
                        showFilterBar || activeFilter !== 'all'
                          ? (isDark ? '#C084FC' : '#7C3AED')
                          : colors.textSecondary
                      }
                    />
                    {activeFilter !== 'all' && (
                      <View style={[styles.filterActiveDot, { backgroundColor: isDark ? '#C084FC' : '#7C3AED' }]} />
                    )}
                  </TouchableOpacity>

                  {/* Multi-Select / Calculate Toggle Button */}
                  <TouchableOpacity
                    style={[
                      styles.calcToggleBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
                      },
                      isSelectMode && {
                        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.22)' : '#FAF5FF',
                        borderColor: isDark ? 'rgba(192, 132, 252, 0.6)' : '#C4B5FD',
                      },
                    ]}
                    onPress={handleToggleSelectMode}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={isSelectMode ? 'checklist' : 'calculate'}
                      size={19}
                      color={isSelectMode ? (isDark ? '#C084FC' : '#7C3AED') : colors.textSecondary}
                    />
                    {isSelectMode && (
                      <View style={[styles.filterActiveDot, { backgroundColor: isDark ? '#C084FC' : '#7C3AED' }]} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Title & Transaction Counter Badge */}
                <View style={styles.titleWithBadge}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('recentTransactions')}</Text>
                  {filteredTransactions.length > 0 && (
                    <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0' }]}>
                      <Text style={[styles.countBadgeText, { color: isDark ? '#94A3B8' : '#334155' }]}>
                        {filteredTransactions.length}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Row 2: Full Width, Comfortable Search Input Bar */}
              <View
                style={[
                  styles.searchBoxFull,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
                  },
                  !isRTL && { flexDirection: 'row-reverse' },
                ]}
              >
              <MaterialIcons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: colors.textPrimary },
                  !isRTL ? { textAlign: 'left' } : { textAlign: 'right' },
                ]}
                placeholder={t('searchPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Expandable Ready Filter Buttons Row (أزرار الفلترة الحاضرة) */}
          {(showFilterBar || activeFilter !== 'all') && (
            <View style={styles.filterPillsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.filterPillsScroll,
                  !isRTL && { flexDirection: 'row-reverse' },
                ]}
              >
                {/* Ready Button: All */}
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    activeFilter === 'all' && {
                      backgroundColor: isDark ? '#38BDF8' : '#0F172A',
                      borderColor: isDark ? '#38BDF8' : '#0F172A',
                    },
                  ]}
                  onPress={() => setActiveFilter('all')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: colors.textSecondary },
                      activeFilter === 'all' && {
                        color: isDark ? '#080C15' : '#FFFFFF',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {t('all')}
                  </Text>
                </TouchableOpacity>

                {/* Smart CALCUL Total for Filtered Results (حساب مجموع الفلترة) */}
                {(activeFilter !== 'all' || searchQuery.trim().length > 0) && filteredTransactions.length > 0 && (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      styles.filterCalcChip,
                      {
                        backgroundColor: isDark ? 'rgba(168, 85, 247, 0.22)' : '#FAF5FF',
                        borderColor: isDark ? 'rgba(192, 132, 252, 0.6)' : '#DDD6FE',
                      },
                    ]}
                    onPress={handleCalculateFiltered}
                    activeOpacity={0.75}
                  >
                    <MaterialIcons
                      name="calculate"
                      size={15}
                      color={isDark ? '#C084FC' : '#7C3AED'}
                    />
                    <Text
                      style={[
                        styles.filterCalcChipText,
                        { color: isDark ? '#C084FC' : '#7C3AED' },
                      ]}
                    >
                      {t('calculateFilterTotal', 'CALCUL Total')}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Add Custom Filter Button (+ إضافة فلتر على كيفك) */}
                <TouchableOpacity
                  style={[
                    styles.addFilterChip,
                    {
                      backgroundColor: isDark ? 'rgba(168, 85, 247, 0.18)' : '#FAF5FF',
                      borderColor: isDark ? 'rgba(192, 132, 252, 0.5)' : '#DDD6FE',
                    },
                  ]}
                  onPress={() => setCustomFilterModalVisible(true)}
                  activeOpacity={0.75}
                >
                  <MaterialIcons name="add" size={15} color={isDark ? '#C084FC' : '#7C3AED'} />
                  <Text
                    style={[
                      styles.addFilterChipText,
                      { color: isDark ? '#C084FC' : '#7C3AED' },
                    ]}
                  >
                    {t('addCustomFilter')}
                  </Text>
                </TouchableOpacity>

                {/* User Defined Custom Filters (أزرار الفلترة اللي على كيف المستخدم) */}
                {customFilters.map((custom) => (
                  <TouchableOpacity
                    key={custom.id}
                    style={[
                      styles.filterChip,
                      styles.customFilterChip,
                      {
                        backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
                        borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : '#FDE68A',
                      },
                      activeFilter === custom.id && styles.customFilterChipActive,
                    ]}
                    onPress={() => setActiveFilter(activeFilter === custom.id ? 'all' : custom.id)}
                    onLongPress={() => handleDeleteCustomFilter(custom.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="star"
                      size={12}
                      color={activeFilter === custom.id ? '#FEF08A' : '#D97706'}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        activeFilter === custom.id
                          ? styles.customFilterChipTextActive
                          : [styles.customFilterChipText, isDark && { color: '#FBBF24' }],
                      ]}
                    >
                      {custom.label}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomFilter(custom.id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteFilterIconBtn}
                    >
                      <MaterialIcons
                        name="close"
                        size={12}
                        color={activeFilter === custom.id ? '#FFFFFF' : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}

                {/* Ready Button: Expenses */}
                {!hiddenFilters.includes('expense') && (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      activeFilter === 'expense' && {
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
                        borderColor: isDark ? 'rgba(248, 113, 113, 0.4)' : '#FECACA',
                      },
                    ]}
                    onPress={() => setActiveFilter(activeFilter === 'expense' ? 'all' : 'expense')}
                    onLongPress={() => handleDeleteDefaultFilter('expense', t('expenses'))}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.filterChipDot, { backgroundColor: isDark ? '#F87171' : '#EF4444' }]} />
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: colors.textSecondary },
                        activeFilter === 'expense' && {
                          color: isDark ? '#F87171' : '#DC2626',
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {t('expenses')}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteDefaultFilter('expense', t('expenses'));
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteFilterIconBtn}
                    >
                      <MaterialIcons
                        name="close"
                        size={12}
                        color={activeFilter === 'expense' ? (isDark ? '#F87171' : '#DC2626') : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}

                {/* Ready Button: Income */}
                {!hiddenFilters.includes('income') && (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      activeFilter === 'income' && {
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
                        borderColor: isDark ? 'rgba(52, 211, 153, 0.4)' : '#A7F3D0',
                      },
                    ]}
                    onPress={() => setActiveFilter(activeFilter === 'income' ? 'all' : 'income')}
                    onLongPress={() => handleDeleteDefaultFilter('income', t('income'))}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.filterChipDot, { backgroundColor: isDark ? '#34D399' : '#10B981' }]} />
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: colors.textSecondary },
                        activeFilter === 'income' && {
                          color: isDark ? '#34D399' : '#059669',
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {t('income')}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteDefaultFilter('income', t('income'));
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteFilterIconBtn}
                    >
                      <MaterialIcons
                        name="close"
                        size={12}
                        color={activeFilter === 'income' ? (isDark ? '#34D399' : '#059669') : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}

                {/* Ready Category Filter Buttons */}
                {['طعام', 'نقل', 'تسوق', 'فواتير', 'عمل', 'ترفيه', 'أخرى']
                  .filter((cat) => !hiddenFilters.includes(cat))
                  .map((cat) => {
                    const label = getCategoryLabel(cat, t);
                    const isActive = activeFilter === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.filterChip,
                          { backgroundColor: colors.surface, borderColor: colors.border },
                          isActive && {
                            backgroundColor: isDark ? '#38BDF8' : '#0F172A',
                            borderColor: isDark ? '#38BDF8' : '#0F172A',
                          },
                        ]}
                        onPress={() => setActiveFilter(isActive ? 'all' : cat)}
                        onLongPress={() => handleDeleteDefaultFilter(cat, label)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            { color: colors.textSecondary },
                            isActive && {
                              color: isDark ? '#080C15' : '#FFFFFF',
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {label}
                        </Text>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteDefaultFilter(cat, label);
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.deleteFilterIconBtn}
                        >
                          <MaterialIcons
                            name="close"
                            size={12}
                            color={isActive ? (isDark ? '#080C15' : '#FFFFFF') : colors.textSecondary}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}

                {/* Restore Hidden Default Filters Button */}
                {hiddenFilters.length > 0 && (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1',
                        borderStyle: 'dashed',
                      },
                    ]}
                    onPress={handleResetHiddenFilters}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="restore"
                      size={14}
                      color={isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isDark ? '#94A3B8' : '#64748B',
                          fontSize: 11,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {t('restoreFilters')}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

            <View style={styles.transactionsList}>
              {filteredTransactions.length === 0 ? (
                <View
                  style={[
                    styles.emptySearchContainer,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
                    },
                  ]}
                >
                  <View style={[styles.emptyIconPill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(13, 148, 136, 0.10)' }]}>
                    <MaterialIcons
                      name={searchQuery || activeFilter !== 'all' ? 'search-off' : 'receipt-long'}
                      size={30}
                      color={isDark ? '#94A3B8' : '#0D9488'}
                    />
                  </View>
                  <Text style={[styles.emptySearchText, { color: isDark ? '#94A3B8' : '#334155' }]}>
                    {searchQuery || activeFilter !== 'all' ? t('noSearchResults') : t('noTransactionsYet')}
                  </Text>
                  {(searchQuery || activeFilter !== 'all') && (
                    <TouchableOpacity
                      style={[
                        styles.clearSearchBtn,
                        {
                          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
                          borderColor: isDark ? 'rgba(52, 211, 153, 0.3)' : '#A7F3D0',
                        },
                      ]}
                      onPress={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.clearSearchBtnText, { color: isDark ? '#34D399' : '#059669' }]}>
                        {t('clearFilter')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                filteredTransactions.map((tx) => (
                  <AnimatedTransactionCard
                    key={tx.id}
                    tx={tx}
                    isRTL={isRTL}
                    isDark={isDark}
                    colors={colors}
                    t={t}
                    onDeletePress={handleRequestDelete}
                    isDeleting={deletingTxId === tx.id}
                    onDeleteAnimationComplete={handleCardAnimationComplete}
                    isNew={lastAddedTx?.id === tx.id}
                    currency={currency}
                    isSelectMode={isSelectMode}
                    isSelected={selectedTxIds.includes(tx.id)}
                    onToggleSelect={toggleSelectTx}
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Floating Selection & Calculation Action Bar */}
      {isSelectMode && (
        <View style={styles.floatingSelectBarContainer}>
          <View
            style={[
              styles.floatingSelectBar,
              {
                backgroundColor: isDark ? '#111827' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : '#E2E8F0',
              },
              !isRTL && { flexDirection: 'row-reverse' },
            ]}
          >
            {/* Close Selection Mode Button */}
            <TouchableOpacity
              onPress={handleToggleSelectMode}
              style={[
                styles.selectCloseBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="close" size={17} color={isDark ? '#E2E8F0' : '#475569'} />
            </TouchableOpacity>

            {/* Selection Count and Select/Deselect All Toggle */}
            <View style={[styles.selectInfoCol, !isRTL && { alignItems: 'flex-start' }]}>
              <Text style={[styles.selectCountText, { color: colors.textPrimary }]}>
                {selectedTxIds.length} {t('selectedItems', 'محددة')}
              </Text>
              <TouchableOpacity
                onPress={
                  selectedTxIds.length === filteredTransactions.length && filteredTransactions.length > 0
                    ? deselectAllTransactions
                    : selectAllTransactions
                }
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={[styles.selectAllLink, { color: isDark ? '#38BDF8' : '#0284C7' }]}>
                  {selectedTxIds.length === filteredTransactions.length && filteredTransactions.length > 0
                    ? t('deselectAll', 'إلغاء التحديد')
                    : t('selectAll', 'تحديد الكل')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Big Action Button: CALCUL */}
            <TouchableOpacity
              style={[
                styles.calcActionBtn,
                {
                  backgroundColor: selectedTxIds.length > 0
                    ? (isDark ? '#38BDF8' : '#0F172A')
                    : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'),
                },
              ]}
              onPress={handleCalculateSelected}
              disabled={selectedTxIds.length === 0}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="calculate"
                size={18}
                color={
                  selectedTxIds.length > 0
                    ? (isDark ? '#080C15' : '#FFFFFF')
                    : (isDark ? '#64748B' : '#94A3B8')
                }
              />
              <Text
                style={[
                  styles.calcActionBtnText,
                  {
                    color: selectedTxIds.length > 0
                      ? (isDark ? '#080C15' : '#FFFFFF')
                      : (isDark ? '#64748B' : '#94A3B8'),
                  },
                ]}
              >
                {t('calculate', 'CALCUL')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <View style={[styles.bottomNav, { backgroundColor: colors.navBg, borderColor: colors.navBorder }]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('/explore')}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="leaderboard"
              size={22}
              color={activeTab === 'stats' ? (isDark ? '#2DD4BF' : '#0D9488') : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Center Action Button (Floating Plus) */}
          <View style={styles.micButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/add-transaction')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={[styles.micButton, { borderColor: colors.background }]}
              >
                <MaterialIcons name="add" size={24} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.8}
          >
            {activeTab === 'home' ? (
              <View style={[styles.activeTabPill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#F1F5F9' }]}>
                <MaterialIcons name="home" size={22} color={isDark ? '#2DD4BF' : '#0D9488'} />
              </View>
            ) : (
              <MaterialIcons
                name="home"
                size={22}
                color={colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Instant Feedback Toast */}
      <QuickToast
        visible={toastConfig.visible}
        title={toastConfig.title}
        amount={toastConfig.amount}
        type={toastConfig.type}
        onDismiss={() => setToastConfig(prev => ({ ...prev, visible: false }))}
      />

      {/* Preset Creation and Editing Modal */}
      <PresetModal
        visible={modalVisible}
        presetToEdit={presetToEdit}
        onClose={() => setModalVisible(false)}
        onSave={async (newPreset) => {
          await addPreset(newPreset);
        }}
        onUpdate={async (id, data) => {
          await updatePreset(id, data);
        }}
        onDelete={async (id) => {
          await deletePreset(id);
        }}
      />

      {/* Language Selection Modal */}
      <LanguageModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />

      {/* Custom Filter Modal (إضافة زر فلترة على كيف المستخدم) */}
      <CustomFilterModal
        visible={customFilterModalVisible}
        onClose={() => setCustomFilterModalVisible(false)}
        onAddFilter={handleAddCustomFilter}
      />

      {/* Delete Transaction Modal */}
      <DeleteTransactionModal
        visible={!!txToDelete}
        transaction={txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Financial Calculation Breakdown Modal */}
      <CalculationModal
        visible={calcModalVisible}
        onClose={() => setCalcModalVisible(false)}
        title={calcModalData.title}
        subtitle={calcModalData.subtitle}
        incomeTotal={calcModalData.incomeTotal}
        expenseTotal={calcModalData.expenseTotal}
        netTotal={calcModalData.netTotal}
        incomeCount={calcModalData.incomeCount}
        expenseCount={calcModalData.expenseCount}
        currency={currency}
        isRTL={isRTL}
        isDark={isDark}
        colors={colors}
        t={t}
      />

      {/* Floating Delete Success Notification */}
      {deleteToastVisible && (
        <Animated.View
          style={[
            styles.deleteSuccessToast,
            {
              transform: [{ translateY: deleteToastY }],
              opacity: deleteToastOpacity,
              backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.45)' : '#FCA5A5',
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View style={styles.deleteToastIconWrap}>
            <MaterialIcons name="check-circle" size={18} color="#10B981" />
          </View>
          <Text style={[styles.deleteToastText, { color: colors.textPrimary }]}>
            {t('deleteTxSuccessToast')}
          </Text>
        </Animated.View>
      )}

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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    paddingBottom: 4,
  },
  themeToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languagePill: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  languagePillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  languagePillText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140, // Generous breathing room so floating tab bar never covers bottom transactions
  },
  balanceCard: {
    borderRadius: 24,
    padding: 22,
    marginTop: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(245, 158, 11, 0.35)', // Golden titanium rim
  },
  cardDecorCircle: {
    position: 'absolute',
    top: -45,
    width: 185,
    height: 185,
    borderRadius: 92.5,
    borderWidth: 18,
    borderColor: 'rgba(245, 158, 11, 0.07)', // Soft gold ambient ring
  },
  cardDecorCircleInner: {
    position: 'absolute',
    bottom: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.08)',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  cardChipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.28)',
  },
  cardLabelWrap: {
    alignItems: 'flex-end',
  },
  cardTypePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    marginBottom: 6,
  },
  cardTypeText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    color: '#F1F5F9',
    letterSpacing: 0.3,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  balanceTitle: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12.5,
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  balanceAmountWrap: {
    alignItems: 'flex-end',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  currencyBadgeText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 12,
    color: '#FBBF24',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontFamily: 'Outfit-Black',
    fontSize: 34,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  cardBrandWrap: {
    alignItems: 'flex-start',
  },
  cardBrandName: {
    fontFamily: 'Outfit-Black',
    fontSize: 17,
    color: '#FBBF24',
    letterSpacing: 1.8,
  },
  cardBrandSub: {
    fontFamily: 'Outfit-Bold',
    fontSize: 9,
    color: 'rgba(251, 191, 36, 0.72)',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  glassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionsWhiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
    marginTop: 18,
    marginBottom: 12,
  },
  actionCircleBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionDivider: {
    height: 1,
    marginVertical: 18,
    borderRadius: 1,
  },
  activityCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 0,
    borderColor: 'transparent',
    padding: 16,
    marginTop: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  activityHeaderSection: {
    marginBottom: 14,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchBoxFull: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterToggleBtnActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  filterPillsContainer: {
    marginBottom: 12,
  },
  filterPillsScroll: {
    gap: 8,
    paddingHorizontal: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipActiveExpense: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  filterChipActiveIncome: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  filterChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  addFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FAF5FF',
    borderWidth: 1.2,
    borderColor: '#DDD6FE',
  },
  addFilterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  customFilterChip: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  customFilterChipActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  customFilterChipText: {
    color: '#B45309',
    fontWeight: '600',
  },
  customFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deleteFilterIconBtn: {
    marginHorizontal: 1,
    padding: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 10,
  },
  emptyIconPill: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptySearchText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  clearSearchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
  },
  clearSearchBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  transactionsList: {
    gap: 10,
  },
  transactionCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 78,
  },
  deleteTxBtn: {
    position: 'absolute',
    top: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  txMainGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  txTime: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  txAmountCol: {
    justifyContent: 'center',
    paddingTop: 8,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 280,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    paddingVertical: 2,
  },
  activeTabPill: {
    backgroundColor: '#F1F5F9',
    padding: 6,
    borderRadius: 12,
  },
  micButtonContainer: {
    top: -14,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  deleteSuccessToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 28,
    alignSelf: 'center',
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  deleteToastIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteToastText: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calcToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterCalcChip: {
    backgroundColor: '#FAF5FF',
    borderColor: '#DDD6FE',
    borderWidth: 1.2,
  },
  filterCalcChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  floatingSelectBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 84 : 72,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 999,
  },
  floatingSelectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    gap: 12,
  },
  selectCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  selectCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectAllLink: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 1,
  },
  calcActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
  },
  calcActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
