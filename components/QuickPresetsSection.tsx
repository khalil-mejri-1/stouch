import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { QuickPreset, useTransactions } from '../context/TransactionsContext';
import { useLanguage, getCategoryLabel } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface PresetCardItemProps {
  preset: QuickPreset;
  colors: any;
  isDark: boolean;
  isRTL: boolean;
  currency: string;
  onTriggerPreset: (preset: QuickPreset) => void;
  onOpenEditModal: (preset: QuickPreset) => void;
  t: (key: string, def?: string) => string;
}

const PresetCardItem: React.FC<PresetCardItemProps> = ({
  preset,
  colors,
  isDark,
  isRTL,
  currency,
  onTriggerPreset,
  onOpenEditModal,
  t,
}) => {
  const isIncome = preset.type === 'income';
  const accentColor =
    preset.color ||
    (isIncome
      ? isDark
        ? '#34D399'
        : '#059669'
      : isDark
      ? '#F87171'
      : '#DC2626');
  const pressScaleAnim = useRef(new Animated.Value(1)).current;

  const handleCardPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    Animated.sequence([
      Animated.timing(pressScaleAnim, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(pressScaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    onTriggerPreset(preset);
  };

  const handleEditPress = (e: any) => {
    e.stopPropagation();
    try {
      Haptics.selectionAsync();
    } catch {}
    onOpenEditModal(preset);
  };

  // Safe fallback icon
  const iconName = (preset.icon || (isIncome ? 'payments' : 'category')) as any;

  return (
    <Animated.View style={{ transform: [{ scale: pressScaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.presetCard,
          {
            backgroundColor: isDark ? '#1D283C' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
          },
        ]}
        onPress={handleCardPress}
        activeOpacity={0.88}
      >
        {/* Subtle Top Glow Accent Line */}
        <View
          style={[
            styles.topAccentGlow,
            {
              backgroundColor: accentColor,
              [isRTL ? 'right' : 'left']: 14,
            },
          ]}
        />

        {/* Row 1: Icon Squircle Badge + Edit Action Button */}
        <View style={[styles.cardHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View
            style={[
              styles.iconSquircle,
              {
                backgroundColor: isDark
                  ? `${accentColor}22`
                  : `${accentColor}14`,
                borderColor: isDark
                  ? `${accentColor}40`
                  : `${accentColor}28`,
              },
            ]}
          >
            <MaterialIcons name={iconName} size={19} color={accentColor} />
          </View>

          <TouchableOpacity
            style={[
              styles.editBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(0, 0, 0, 0.04)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
            onPress={handleEditPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.65}
          >
            <MaterialIcons
              name="edit"
              size={12}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
        </View>

        {/* Row 2: Title & Category Sub-label */}
        <View style={styles.cardCenterBlock}>
          <Text
            style={[
              styles.presetTitle,
              {
                color: colors.textPrimary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {preset.title}
          </Text>

          <Text
            style={[
              styles.presetCategory,
              {
                color: isDark ? '#94A3B8' : '#64748B',
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            numberOfLines={1}
          >
            {getCategoryLabel(preset.category, t)}
          </Text>
        </View>

        {/* Row 3: Prominent Color-coded Amount */}
        <View style={[styles.cardBottomRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text
            style={[
              styles.presetAmount,
              {
                color: isIncome
                  ? isDark
                    ? '#34D399'
                    : '#059669'
                  : isDark
                  ? '#F87171'
                  : '#E11D48',
              },
            ]}
            numberOfLines={1}
          >
            {isIncome ? '+' : '–'}&nbsp;
            {preset.amount.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
            })}
          </Text>
          <Text
            style={[
              styles.presetCurrency,
              { color: isDark ? '#64748B' : '#94A3B8' },
            ]}
          >
            {currency}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface QuickPresetsSectionProps {
  onTriggerPreset: (preset: QuickPreset) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (preset: QuickPreset) => void;
}

export const QuickPresetsSection: React.FC<QuickPresetsSectionProps> = ({
  onTriggerPreset,
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const { presets } = useTransactions();
  const { t, currency, isRTL } = useLanguage();
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
        },
      ]}
    >
      {/* Section Header: Title + Count Badge + Refined Action Button */}
      <View
        style={[
          styles.headerRow,
          isRTL ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' },
        ]}
      >
        {/* Title and Count Badge */}
        <View
          style={[
            styles.titleWrap,
            isRTL && { flexDirection: 'row-reverse' },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('quickPresetsTitle')}
          </Text>
          {presets.length > 0 && (
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : '#F1F5F9',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.12)'
                    : '#E2E8F0',
                },
              ]}
            >
              <Text
                style={[
                  styles.countBadgeText,
                  { color: isDark ? '#94A3B8' : '#475569' },
                ]}
              >
                {presets.length}
              </Text>
            </View>
          )}
        </View>

        {/* Refined Luxury '+ Nouveau' Button */}
        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: isDark
                ? 'rgba(59, 130, 246, 0.14)'
                : '#EFF6FF',
              borderColor: isDark
                ? 'rgba(96, 165, 250, 0.35)'
                : '#BFDBFE',
            },
          ]}
          onPress={onOpenAddModal}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="add"
            size={16}
            color={isDark ? '#60A5FA' : '#2563EB'}
          />
          <Text
            style={[
              styles.addBtnText,
              { color: isDark ? '#93C5FD' : '#1D4ED8' },
            ]}
          >
            {t('newPreset')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll List of Sleek Fintech Cards */}
      {presets.length === 0 ? (
        <View
          style={[
            styles.emptyContainer,
            {
              backgroundColor: isDark ? '#141D2E' : '#F8FAFC',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
            },
          ]}
        >
          <View
            style={[
              styles.emptyIconCircle,
              {
                backgroundColor: isDark
                  ? 'rgba(59, 130, 246, 0.12)'
                  : '#EFF6FF',
              },
            ]}
          >
            <MaterialIcons
              name="touch-app"
              size={26}
              color={isDark ? '#60A5FA' : '#2563EB'}
            />
          </View>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('emptyPresets')}
          </Text>
          <TouchableOpacity
            style={[
              styles.emptyAddBtn,
              {
                backgroundColor: isDark
                  ? 'rgba(59, 130, 246, 0.18)'
                  : '#EFF6FF',
                borderColor: isDark
                  ? 'rgba(96, 165, 250, 0.4)'
                  : '#BFDBFE',
              },
            ]}
            onPress={onOpenAddModal}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.emptyAddBtnText,
                { color: isDark ? '#93C5FD' : '#1D4ED8' },
              ]}
            >
              {t('newPreset')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.horizontalScrollList,
            isRTL && { flexDirection: 'row-reverse' },
          ]}
        >
          {presets.map((preset) => (
            <PresetCardItem
              key={preset.id}
              preset={preset}
              colors={colors}
              isDark={isDark}
              isRTL={isRTL}
              currency={currency}
              onTriggerPreset={onTriggerPreset}
              onOpenEditModal={onOpenEditModal}
              t={t}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 16,
    marginTop: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  headerRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  horizontalScrollList: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 4,
  },
  presetCard: {
    position: 'relative',
    width: 146,
    height: 128,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  topAccentGlow: {
    position: 'absolute',
    top: 0,
    width: 30,
    height: 2.5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.9,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconSquircle: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenterBlock: {
    marginTop: 6,
    marginBottom: 4,
    gap: 2,
  },
  presetTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  presetCategory: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  presetAmount: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    letterSpacing: -0.3,
  },
  presetCurrency: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    marginBottom: 12,
  },
  emptyAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
