import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export interface Transaction {
  id: string;
  title: string;
  time: string;
  amount: string; // e.g. "45.00 د.ت"
  tag: string;
  type: 'income' | 'expense';
  icon: string;
  iconColor: string;
  bgColor: string;
  tagBg: string;
  tagBorder: string;
  numericAmount: number;
  timestamp: number;
}

export interface QuickPreset {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  icon?: string;
  color?: string;
}

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (title: string, amount: string, type: 'income' | 'expense', category: string, customIcon?: string) => Transaction;
  updateTransaction: (
    id: string,
    updatedData: {
      title?: string;
      numericAmount?: number;
      type?: 'income' | 'expense';
      tag?: string;
      customIcon?: string;
    }
  ) => Transaction | null;
  deleteTransaction: (id: string) => void;
  getBalance: () => number;
  presets: QuickPreset[];
  addPreset: (preset: Omit<QuickPreset, 'id'>) => Promise<QuickPreset>;
  updatePreset: (id: string, preset: Partial<QuickPreset>) => Promise<void>;
  deletePreset: (id: string) => Promise<void>;
  triggerPreset: (preset: QuickPreset) => Transaction;
  lastAddedTx: Transaction | null;
  clearLastAddedTx: () => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};

const DEFAULT_PRESETS: QuickPreset[] = [
  {
    id: 'preset-technotech',
    title: 'Technotech',
    amount: 9,
    type: 'income',
    category: 'دخل',
    icon: 'business-center',
    color: '#059669',
  },
  {
    id: 'preset-coffee',
    title: 'قهوة سريعة',
    amount: 2.5,
    type: 'expense',
    category: 'طعام',
    icon: 'local-cafe',
    color: '#f97316',
  },
  {
    id: 'preset-fuel',
    title: 'بنزين وقود',
    amount: 20,
    type: 'expense',
    category: 'نقل',
    icon: 'local-gas-station',
    color: '#60a5fa',
  },
  {
    id: 'preset-shopping',
    title: 'مشتريات خفيفة',
    amount: 15,
    type: 'expense',
    category: 'تسوق',
    icon: 'shopping-bag',
    color: '#ec4899',
  },
];

/**
 * Formats a transaction time string so that isolated Arabic AM/PM abbreviations
 * ('م' / 'ص') are rendered as their full words ('مساءً' / 'صباحاً').
 */
export const formatTransactionTime = (timeStr: string): string => {
  if (!timeStr) return '';
  return timeStr
    // Replace '10:13 م' -> '10:13 مساءً'
    .replace(/(\d{1,2}:\d{2}(?::\d{2})?)[\s\u00A0\u202F]*م(?=\s|$|[،,.:;!?-])/g, (m, g1) => `${g1} مساءً`)
    // Replace '10:13 ص' -> '10:13 صباحاً'
    .replace(/(\d{1,2}:\d{2}(?::\d{2})?)[\s\u00A0\u202F]*ص(?=\s|$|[،,.:;!?-])/g, (m, g1) => `${g1} صباحاً`)
    // Fallback for standalone 'م' or 'ص'
    .replace(/(^|[\s\u00A0\u202F])م(?=[\s\u00A0\u202F،,.:;!?-]|$)/g, (m, g1) => `${g1}مساءً`)
    .replace(/(^|[\s\u00A0\u202F])ص(?=[\s\u00A0\u202F،,.:;!?-]|$)/g, (m, g1) => `${g1}صباحاً`);
};

/**
 * Formats a transaction amount string dynamically according to current currency (DT / د.ت)
 */
export const formatTransactionAmount = (
  tx: { numericAmount?: number; amount?: string; type?: 'income' | 'expense' },
  currency: string = 'DT'
): string => {
  if (tx.numericAmount != null) {
    const sign = tx.type === 'income' ? '+ ' : '- ';
    return `${sign}${tx.numericAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`;
  }
  if (tx.amount) {
    return tx.amount.replace(/د\.ت|TND/g, currency);
  }
  return '';
};

export const getCategoryStyles = (category: string, customIcon?: string) => {
  let icon = customIcon || 'category';
  let iconColor = '#9ca3af';
  let bgColor = 'rgba(156, 163, 175, 0.1)';
  let tagBg = 'rgba(156, 163, 175, 0.15)';
  let tagBorder = 'rgba(156, 163, 175, 0.25)';

  const catLower = (category || '').toLowerCase().trim();
  if (catLower === 'طعام' || catLower === 'food' || catLower === 'alimentation' || catLower === 'catfood') {
    if (!customIcon) icon = 'restaurant';
    iconColor = '#f97316';
    bgColor = 'rgba(251, 146, 60, 0.1)';
    tagBg = 'rgba(251, 146, 60, 0.15)';
    tagBorder = 'rgba(251, 146, 60, 0.25)';
  } else if (catLower === 'نقل' || catLower === 'transport' || catLower === 'cattransport') {
    if (!customIcon) icon = 'directions-car';
    iconColor = '#60a5fa';
    bgColor = 'rgba(96, 165, 250, 0.1)';
    tagBg = 'rgba(96, 165, 250, 0.15)';
    tagBorder = 'rgba(96, 165, 250, 0.25)';
  } else if (catLower === 'تسوق' || catLower === 'shopping' || catLower === 'catshopping') {
    if (!customIcon) icon = 'shopping-bag';
    iconColor = '#ec4899';
    bgColor = 'rgba(236, 72, 153, 0.1)';
    tagBg = 'rgba(236, 72, 153, 0.15)';
    tagBorder = 'rgba(236, 72, 153, 0.25)';
  } else if (catLower === 'دخل' || catLower === 'income' || catLower === 'revenu' || catLower === 'catincome' || catLower === 'راتب') {
    if (!customIcon) icon = 'payments';
    iconColor = '#059669';
    bgColor = 'rgba(5, 150, 105, 0.1)';
    tagBg = 'rgba(5, 150, 105, 0.15)';
    tagBorder = 'rgba(5, 150, 105, 0.25)';
  } else if (catLower === 'عمل' || catLower === 'work' || catLower === 'travail' || catLower === 'catwork') {
    if (!customIcon) icon = 'business-center';
    iconColor = '#3b82f6';
    bgColor = 'rgba(59, 130, 246, 0.1)';
    tagBg = 'rgba(59, 130, 246, 0.15)';
    tagBorder = 'rgba(59, 130, 246, 0.25)';
  } else if (catLower === 'ترفيه' || catLower === 'entertainment' || catLower === 'loisirs' || catLower === 'catentertainment') {
    if (!customIcon) icon = 'movie';
    iconColor = '#A855F7';
    bgColor = 'rgba(168, 85, 247, 0.1)';
    tagBg = 'rgba(168, 85, 247, 0.15)';
    tagBorder = 'rgba(168, 85, 247, 0.25)';
  } else if (catLower === 'فواتير' || catLower === 'bills' || catLower === 'factures' || catLower === 'catbills') {
    if (!customIcon) icon = 'receipt';
    iconColor = '#eab308';
    bgColor = 'rgba(234, 179, 8, 0.1)';
    tagBg = 'rgba(234, 179, 8, 0.15)';
    tagBorder = 'rgba(234, 179, 8, 0.25)';
  }

  return { icon, iconColor, bgColor, tagBg, tagBorder };
};

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [presets, setPresets] = useState<QuickPreset[]>(DEFAULT_PRESETS);
  const [lastAddedTx, setLastAddedTx] = useState<Transaction | null>(null);

  const clearLastAddedTx = () => {
    setLastAddedTx(null);
  };

  // Load transactions and presets from AsyncStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedTx = await AsyncStorage.getItem('transactions');
        if (storedTx) {
          const parsed: Transaction[] = JSON.parse(storedTx);
          const migrated = parsed.map(tx => {
            const numeric = tx.numericAmount != null
              ? tx.numericAmount
              : parseFloat((tx.amount || '').replace(/[^0-9.]/g, '')) || 0;
            return {
              ...tx,
              time: formatTransactionTime(tx.time),
              numericAmount: numeric,
            };
          });
          setTransactions(migrated);
        }

        const storedPresets = await AsyncStorage.getItem('quick_presets');
        if (storedPresets) {
          const parsed = JSON.parse(storedPresets);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPresets(parsed);
          } else {
            setPresets(DEFAULT_PRESETS);
            await AsyncStorage.setItem('quick_presets', JSON.stringify(DEFAULT_PRESETS));
          }
        } else {
          // Initialize with default presets including Technotech
          await AsyncStorage.setItem('quick_presets', JSON.stringify(DEFAULT_PRESETS));
        }
      } catch (e) {
        console.error('Failed to load stored data', e);
      }
    };
    loadStoredData();
  }, []);

  const saveTransactions = async (newTxList: Transaction[]) => {
    try {
      await AsyncStorage.setItem('transactions', JSON.stringify(newTxList));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  };

  const savePresets = async (newPresets: QuickPreset[]) => {
    try {
      await AsyncStorage.setItem('quick_presets', JSON.stringify(newPresets));
    } catch (e) {
      console.error('Failed to save presets', e);
    }
  };

  const addTransaction = (
    title: string,
    amountStr: string,
    type: 'income' | 'expense',
    category: string,
    customIcon?: string
  ): Transaction => {
    const numericVal = parseFloat(amountStr.replace(/[^0-9.]/g, '')) || 0;
    
    // Map category to styles and icon
    const { icon, iconColor, bgColor, tagBg, tagBorder } = getCategoryStyles(category, customIcon);

    const formatter = new Intl.DateTimeFormat('ar-TN-u-nu-latn', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    const timeFormatted = formatTransactionTime(formatter.format(new Date()));

    const amountFormatted = `${type === 'income' ? '+ ' : '- '}${numericVal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} د.ت`;

    const newTx: Transaction = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      title: title || (type === 'income' ? 'دخل جديد' : 'مصروف جديد'),
      time: timeFormatted,
      amount: amountFormatted,
      tag: category,
      type,
      icon,
      iconColor,
      bgColor,
      tagBg,
      tagBorder,
      numericAmount: numericVal,
      timestamp: Date.now()
    };

    setLastAddedTx(newTx);
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      saveTransactions(updated);
      return updated;
    });

    return newTx;
  };

  const updateTransaction = (
    id: string,
    updatedData: {
      title?: string;
      numericAmount?: number;
      type?: 'income' | 'expense';
      tag?: string;
      customIcon?: string;
    }
  ): Transaction | null => {
    let resultTx: Transaction | null = null;

    setTransactions((prev) => {
      const updated = prev.map((tx) => {
        if (tx.id !== id) return tx;

        const nextType = updatedData.type !== undefined ? updatedData.type : tx.type;
        const nextAmount = updatedData.numericAmount !== undefined ? updatedData.numericAmount : tx.numericAmount;
        const nextTag = updatedData.tag !== undefined ? updatedData.tag : tx.tag;
        const nextTitle = updatedData.title !== undefined ? updatedData.title : tx.title;

        const catStyles = getCategoryStyles(nextTag, updatedData.customIcon || tx.icon);

        const amountFormatted = `${nextType === 'income' ? '+ ' : '- '}${nextAmount.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
        })} د.ت`;

        resultTx = {
          ...tx,
          title: nextTitle,
          type: nextType,
          numericAmount: nextAmount,
          amount: amountFormatted,
          tag: nextTag,
          icon: catStyles.icon,
          iconColor: catStyles.iconColor,
          bgColor: catStyles.bgColor,
          tagBg: catStyles.tagBg,
          tagBorder: catStyles.tagBorder,
        };

        return resultTx;
      });

      saveTransactions(updated);
      return updated;
    });

    return resultTx;
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(tx => tx.id !== id);
      saveTransactions(updated);
      return updated;
    });
  };

  const getBalance = () => {
    return transactions.reduce((acc, tx) => {
      if (tx.type === 'income') {
        return acc + tx.numericAmount;
      } else {
        return acc - tx.numericAmount;
      }
    }, 0);
  };

  // Quick Presets Actions
  const addPreset = async (presetData: Omit<QuickPreset, 'id'>): Promise<QuickPreset> => {
    const newPreset: QuickPreset = {
      id: 'preset-' + Date.now().toString(),
      ...presetData,
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    await savePresets(updated);
    return newPreset;
  };

  const updatePreset = async (id: string, updatedFields: Partial<QuickPreset>) => {
    const updated = presets.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setPresets(updated);
    await savePresets(updated);
  };

  const deletePreset = async (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    await savePresets(updated);
  };

  const triggerPreset = (preset: QuickPreset): Transaction => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // safe fallback if haptics unavailable
    }

    return addTransaction(
      preset.title,
      preset.amount.toString(),
      preset.type,
      preset.category,
      preset.icon
    );
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getBalance,
        presets,
        addPreset,
        updatePreset,
        deletePreset,
        triggerPreset,
        lastAddedTx,
        clearLastAddedTx,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};
