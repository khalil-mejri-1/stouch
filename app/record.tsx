import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
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

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

interface ExtractedTransaction {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

const getSafeFetch = (): typeof fetch => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const cleanFetch = iframe.contentWindow?.fetch;
      document.body.removeChild(iframe);
      if (cleanFetch) {
        return cleanFetch.bind(window);
      }
    } catch {
      // fallback to global fetch
    }
  }
  return fetch;
};

export default function RecordScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { t, language, isRTL, currency } = useLanguage();
  const { colors, isDark } = useTheme();
  
  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(t('voicePromptReady'));
  const [transcript, setTranscript] = useState('');
  const [extractedTx, setExtractedTx] = useState<ExtractedTransaction | null>(null);

  // Ask for microphone permissions on mount
  useEffect(() => {
    async function getPermission() {
      try {
        const perm = await AudioModule.requestRecordingPermissionsAsync();
        if (!perm.granted) {
          setStatusMessage(t('voiceMicPermissionError'));
        }
        await AudioModule.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      } catch (err) {
        console.error('Failed to get mic permissions', err);
        setStatusMessage(t('voiceMicPermissionError'));
      }
    }
    getPermission();
  }, []);

  const startRecording = async () => {
    try {
      setTranscript('');
      setExtractedTx(null);
      setStatusMessage(t('voiceMicStarting'));
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      setStatusMessage(t('voiceListening'));
    } catch (err) {
      console.error('Failed to start recording', err);
      setStatusMessage(t('voiceStartFailed'));
    }
  };

  const stopRecording = async () => {
    try {
      setStatusMessage(t('voiceProcessing'));
      setIsLoading(true);
      setIsRecording(false);
      
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (uri) {
        await processAudio(uri);
      } else {
        setStatusMessage(t('voiceNoAudioFile'));
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setStatusMessage(t('voiceStopFailed'));
      setIsLoading(false);
    }
  };

  const processAudio = async (uri: string) => {
    try {
      const safeFetch = getSafeFetch();

      // 1. Whisper Transcription via Groq
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const audioResponse = await safeFetch(uri);
        const audioBlob = await audioResponse.blob();
        
        let ext = 'm4a';
        if (audioBlob.type.includes('webm')) ext = 'webm';
        else if (audioBlob.type.includes('ogg')) ext = 'ogg';
        else if (audioBlob.type.includes('mp4')) ext = 'mp4';
        else if (audioBlob.type.includes('wav')) ext = 'wav';

        formData.append('file', audioBlob, `audio.${ext}`);
      } else {
        formData.append('file', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: 'audio.m4a',
          type: 'audio/m4a',
        } as any);
      }
      formData.append('model', 'whisper-large-v3');
      formData.append('language', language);

      const transcribeResponse = await safeFetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const errText = await transcribeResponse.text();
        throw new Error(`Whisper failed: ${errText}`);
      }

      const transcribeData = await transcribeResponse.json();
      const userText = transcribeData.text;
      
      if (!userText || userText.trim().length === 0) {
        setStatusMessage(t('voiceNoSpeech'));
        setIsLoading(false);
        return;
      }

      setTranscript(userText);

      // 2. Chat Completion via Groq to extract details
      const systemInstruction = `You are an AI financial assistant parsing expense and income speech in Arabic (including Tunisian Darija), French, or English.
Analyze the user's speech transcript and extract transaction details into JSON format.
Response MUST be a single raw JSON object only (no markdown, no backticks):
{
  "title": string (short concise description matching user language),
  "amount": number (positive numeric value),
  "type": "expense" or "income",
  "category": "طعام" | "نقل" | "تسوق" | "دخل" | "ترفيه" | "فواتير" | "عمل" | "أخرى"
}`;

      let llmResponse = await safeFetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userText }
          ],
          temperature: 0.1,
        }),
      });

      // Fallback to qwen if needed
      if (!llmResponse.ok) {
        llmResponse = await safeFetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.6-27b',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userText }
            ],
            temperature: 0.1,
          }),
        });
      }

      if (!llmResponse.ok) {
        const errorDetail = await llmResponse.text();
        throw new Error(`LLM categorization failed: ${errorDetail}`);
      }

      const llmData = await llmResponse.json();
      const rawJson = llmData.choices[0].message.content.trim();
      let cleanJson = rawJson.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      const parsedTx = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);
      
      if (parsedTx.amount) {
        setExtractedTx({
          title: parsedTx.title || (parsedTx.type === 'income' ? t('income') : t('expenses')),
          amount: parsedTx.amount,
          type: parsedTx.type || 'expense',
          category: parsedTx.category || 'أخرى'
        });
        setStatusMessage(t('voiceExtractionSuccess'));
      } else {
        setStatusMessage(t('voiceAmountUnclear'));
      }
      setIsLoading(false);

    } catch (err) {
      console.error('Error processing audio', err);
      setStatusMessage(t('voiceError'));
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    if (!extractedTx) return;

    addTransaction(
      extractedTx.title,
      extractedTx.amount.toString(),
      extractedTx.type,
      extractedTx.category
    );

    setStatusMessage(t('voiceStatusSaved'));
    setTimeout(() => {
      router.replace('/');
    }, 1200);
  };

  const handleCancel = () => {
    setExtractedTx(null);
    setTranscript('');
    setStatusMessage(t('voiceStatusCancelled'));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Background Blobs */}
      <View style={[styles.blob, styles.topBlob, isDark && { opacity: 0.15 }]} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Row with Back Button */}
        <View style={[styles.header, { borderBottomColor: colors.border }, !isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color={colors.textPrimary}
              style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('voiceRecordTitle')}</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <GlassCard style={styles.voiceAssistantCard}>
              <LinearGradient
                colors={isRecording ? ['#10B981', '#065F46'] : isDark ? ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.03)'] : ['rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.02)']}
                style={styles.voiceWaveGlow}
              />
              
              <Text style={[styles.voiceTitle, { color: colors.textPrimary }]}>
                {isRecording ? t('voiceStatusListening') : isLoading ? t('voiceStatusAnalyzing') : t('voiceAssistant')}
              </Text>
              
              <Text style={[styles.voiceSub, { color: colors.textSecondary }]}>{statusMessage}</Text>

              {transcript ? (
                <View style={[styles.transcriptContainer, { backgroundColor: colors.searchBg, borderColor: colors.border }]}>
                  <Text style={[styles.transcriptLabel, { color: colors.textSecondary }, !isRTL && { textAlign: 'left' }]}>
                    {t('spokenSpeech')}
                  </Text>
                  <Text style={[styles.transcriptText, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
                    "{transcript}"
                  </Text>
                </View>
              ) : null}
              
              {/* Review Extracted Data State */}
              {extractedTx && (
                <View style={styles.reviewWrapper}>
                  <Text style={[styles.reviewTitleHeader, { color: colors.textPrimary }, !isRTL && { textAlign: 'left' }]}>
                    {t('reviewTxDetails')}
                  </Text>
                  <GlassCard style={[styles.reviewCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    {/* Title Item */}
                    <View style={[styles.reviewRow, !isRTL && { flexDirection: 'row' }]}>
                      <Text style={[styles.reviewValue, { color: colors.textPrimary }]}>{extractedTx.title}</Text>
                      <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('txNameLabel')}</Text>
                    </View>

                    {/* Amount Item */}
                    <View style={[styles.reviewRow, !isRTL && { flexDirection: 'row' }]}>
                      <Text style={[styles.reviewValue, styles.reviewAmountValue]}>
                        {extractedTx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {currency}
                      </Text>
                      <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('price')}</Text>
                    </View>

                    {/* Type Item */}
                    <View style={[styles.reviewRow, !isRTL && { flexDirection: 'row' }]}>
                      <View style={[
                        styles.badge,
                        extractedTx.type === 'income' ? styles.badgeIncome : styles.badgeExpense
                      ]}>
                        <Text style={[
                          styles.badgeText,
                          extractedTx.type === 'income' ? styles.badgeTextIncome : styles.badgeTextExpense
                        ]}>
                          {extractedTx.type === 'income' ? t('income') : t('expenses')}
                        </Text>
                      </View>
                      <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>{t('type')}</Text>
                    </View>

                    {/* Category Item */}
                    <View style={[styles.reviewRow, !isRTL && { flexDirection: 'row' }]}>
                      <View style={styles.categoryBadge}>
                        <MaterialIcons 
                          name={
                            extractedTx.category === 'طعام' ? 'restaurant' :
                            extractedTx.category === 'نقل' ? 'directions-car' :
                            extractedTx.category === 'تسوق' ? 'shopping-bag' :
                            extractedTx.category === 'دخل' ? 'payments' :
                            extractedTx.category === 'ترفيه' ? 'movie' : 'category'
                          } 
                          size={16} 
                          color="#0F172A" 
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.categoryBadgeText}>
                          {getCategoryLabel(extractedTx.category, t)}
                        </Text>
                      </View>
                      <Text style={styles.reviewLabel}>{t('txCategoryLabel')}</Text>
                    </View>
                  </GlassCard>

                  {/* Actions Confirmation Row */}
                  <View style={styles.confirmActionsRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={handleCancel}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelBtnText}>{t('cancelAndRetry')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={handleApprove}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#10B981', '#065F46']}
                        style={styles.approveBtnGradient}
                      >
                        <Text style={styles.approveBtnText}>{t('approveAndSave')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Recording Wave representation */}
              {!extractedTx && (
                <View style={styles.voiceWaveContainer}>
                  {isLoading ? (
                    <ActivityIndicator size="large" color="#10B981" />
                  ) : isRecording ? (
                    <View style={styles.waveLayout}>
                      <View style={[styles.voiceBar, { height: 60 }]} />
                      <View style={[styles.voiceBar, { height: 110 }]} />
                      <View style={[styles.voiceBar, { height: 80 }]} />
                      <View style={[styles.voiceBar, { height: 95 }]} />
                      <View style={[styles.voiceBar, { height: 50 }]} />
                    </View>
                  ) : (
                    <MaterialIcons name="mic-none" size={48} color="#CBD5E1" />
                  )}
                </View>
              )}
              
              {/* Record Trigger Button */}
              {!isLoading && !extractedTx && (
                isRecording ? (
                  <View style={styles.confirmActionsRow}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={async () => {
                        try {
                          await audioRecorder.stop();
                        } catch (e) {}
                        setIsRecording(false);
                        setStatusMessage(t('voiceStatusCancelled'));
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelBtnText}>{t('cancelRecording')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={stopRecording}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#10B981', '#065F46']}
                        style={styles.approveBtnGradient}
                      >
                        <Text style={styles.approveBtnText}>{t('finishAndSave')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={startRecording}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#10B981', '#065F46']}
                      style={styles.actionBtnGradient}
                    >
                      <Text style={styles.actionBtnText}>{t('startVoiceRecording')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )
              )}
            </GlassCard>
          </View>
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
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.05,
  },
  topBlob: {
    width: 300,
    height: 300,
    backgroundColor: '#10B981',
    top: -100,
    right: -100,
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceAssistantCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  voiceWaveGlow: {
    position: 'absolute',
    top: -100,
    width: 300,
    height: 200,
    borderRadius: 100,
    opacity: 0.15,
  },
  voiceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  voiceSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  transcriptContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 6,
  },
  transcriptText: {
    fontSize: 15,
    color: '#0F172A',
    textAlign: 'right',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  reviewWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  reviewTitleHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    marginBottom: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  reviewLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  reviewAmountValue: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeIncome: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeExpense: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextIncome: {
    color: '#059669',
  },
  badgeTextExpense: {
    color: '#DC2626',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  approveBtn: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  approveBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  voiceWaveContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  waveLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceBar: {
    width: 6,
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  actionBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  actionBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  glassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
