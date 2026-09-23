import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { useLanguage, Language } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

// Crisp Vector Flags (100% cross-platform, no broken emoji letters on Windows)
const TunisiaFlag = ({ size = 38 }: { size?: number }) => (
  <View style={[styles.flagWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
    <Svg width={size} height={size} viewBox="0 0 36 36">
      {/* Red Background */}
      <Circle cx="18" cy="18" r="18" fill="#E70013" />
      {/* White Central Disk */}
      <Circle cx="18" cy="18" r="8" fill="#FFFFFF" />
      {/* Red Crescent */}
      <Circle cx="18.5" cy="18" r="6" fill="#E70013" />
      <Circle cx="20.2" cy="18" r="4.8" fill="#FFFFFF" />
      {/* Red Star */}
      <Path
        d="M17.2,15.2 L17.9,17.1 L19.9,17.1 L18.3,18.3 L18.9,20.2 L17.2,19.0 L15.5,20.2 L16.1,18.3 L14.5,17.1 L16.5,17.1 Z"
        fill="#E70013"
      />
    </Svg>
  </View>
);

const FranceFlag = ({ size = 38 }: { size?: number }) => (
  <View style={[styles.flagWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
    <Svg width={size} height={size} viewBox="0 0 36 36">
      <Rect x="0" y="0" width="12" height="36" fill="#002654" />
      <Rect x="12" y="0" width="12" height="36" fill="#FFFFFF" />
      <Rect x="24" y="0" width="12" height="36" fill="#ED2939" />
    </Svg>
  </View>
);

const UKFlag = ({ size = 38 }: { size?: number }) => (
  <View style={[styles.flagWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
    <Svg width={size} height={size} viewBox="0 0 36 36">
      <Rect width="36" height="36" fill="#012169" />
      {/* Diagonal Cross White */}
      <Path d="M0,0 L36,36 M36,0 L0,36" stroke="#FFFFFF" strokeWidth="5.5" />
      {/* Diagonal Cross Red */}
      <Path d="M0,0 L36,36 M36,0 L0,36" stroke="#C8102E" strokeWidth="2.8" />
      {/* St. George Cross White */}
      <Path d="M18,0 V36 M0,18 H36" stroke="#FFFFFF" strokeWidth="8.5" />
      {/* St. George Cross Red */}
      <Path d="M18,0 V36 M0,18 H36" stroke="#C8102E" strokeWidth="5" />
    </Svg>
  </View>
);

interface LanguageOption {
  code: Language;
  title: string;
  subtitle: string;
  badge: string;
  FlagComponent: React.FC<{ size?: number }>;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'ar',
    title: 'العربية',
    subtitle: 'تونس (Tunisie)',
    badge: 'TN',
    FlagComponent: TunisiaFlag,
  },
  {
    code: 'fr',
    title: 'Français',
    subtitle: 'France • International',
    badge: 'FR',
    FlagComponent: FranceFlag,
  },
  {
    code: 'en',
    title: 'English',
    subtitle: 'United States • Global',
    badge: 'EN',
    FlagComponent: UKFlag,
  },
];

export const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose }) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { colors, isDark } = useTheme();

  const handleSelectLanguage = (code: Language) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore if haptics unavailable
    }
    setLanguage(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)' }]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Close Button Top Corner */}
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              isRTL ? { left: 16 } : { right: 16 },
            ]}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Glowing Header with Globe Icon */}
          <View style={styles.header}>
            <View style={[styles.globeIconAura, { borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A' }]}>
              <LinearGradient
                colors={isDark ? ['#2D1F0E', '#1A1308'] : ['#FFFBEB', '#FEF3C7']}
                style={styles.globeGradient}
              >
                <MaterialIcons name="language" size={28} color="#D97706" />
              </LinearGradient>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t('selectLanguageTitle')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('selectLanguageSubtitle')}</Text>
          </View>

          {/* Languages List */}
          <View style={styles.languagesList}>
            {LANGUAGE_OPTIONS.map((item) => {
              const isSelected = language === item.code;
              const Flag = item.FlagComponent;

              return (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.langCard,
                    {
                      backgroundColor: colors.surfaceSecondary,
                      borderColor: colors.border,
                    },
                    isSelected && [
                      styles.langCardSelected,
                      isDark && {
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        borderColor: '#F59E0B',
                      },
                    ],
                    !isRTL && { flexDirection: 'row-reverse' },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectLanguage(item.code)}
                >
                  {/* Selection Indicator Pill / Radio */}
                  <View style={styles.indicatorContainer}>
                    {isSelected ? (
                      <LinearGradient
                        colors={['#D4AF37', '#996515']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.selectedBadge}
                      >
                        <MaterialIcons name="check" size={15} color="#ffffff" />
                        <Text style={styles.selectedBadgeText}>
                          {isRTL ? 'مفعل' : 'Actif'}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.unselectedCircle, { borderColor: colors.border }]}>
                        <View style={styles.unselectedInnerDot} />
                      </View>
                    )}
                  </View>

                  {/* Flag & Language Details */}
                  <View style={[styles.langInfoGroup, !isRTL && { flexDirection: 'row-reverse' }]}>
                    <View style={[styles.namesColumn, !isRTL && { alignItems: 'flex-start' }]}>
                      <View style={[styles.titleBadgeRow, !isRTL && { flexDirection: 'row-reverse' }]}>
                        <View style={[styles.countryCodePill, { backgroundColor: colors.surface }]}>
                          <Text style={[styles.countryCodeText, { color: colors.textSecondary }]}>{item.badge}</Text>
                        </View>
                        <Text
                          style={[
                            styles.langTitle,
                            { color: colors.textPrimary },
                            isSelected && styles.langTitleSelected,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <Text style={[styles.langSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                    </View>

                    {/* Vector Flag Badge */}
                    <Flag size={38} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...(StyleSheet.absoluteFill as any),
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 24,
    paddingHorizontal: 20,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
    paddingTop: 4,
  },
  globeIconAura: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  globeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  languagesList: {
    gap: 12,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  langCardSelected: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  langInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  namesColumn: {
    alignItems: 'flex-end',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  langTitleSelected: {
    color: '#D97706',
  },
  countryCodePill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countryCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  langSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  flagWrapper: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  indicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  unselectedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
});
