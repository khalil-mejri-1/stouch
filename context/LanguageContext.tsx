import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'ar' | 'fr' | 'en';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'ar', name: 'العربية', nativeName: 'العربية (تونس)', flag: '🇹🇳' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
];

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // General & Currency
    currency: 'د.ت',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    confirm: 'تأكيد',
    all: 'الكل',
    back: 'رجوع',
    greeting: 'مرحباً بك',
    appTitle: 'ستوتش',

    // Home Screen
    totalBalance: 'إجمالي الرصيد',
    mainWallet: 'المحفظة الرئيسية',
    expenses: 'مصاريف',
    income: 'دخل',
    recentTransactions: 'آخر العمليات',
    searchPlaceholder: 'بحث...',
    noSearchResults: 'لا توجد نتائج مطابقة',
    clearFilter: 'إلغاء الفلترة',
    addCustomFilter: 'فلتر مخصص',
    customFilterModalTitle: 'زر فلترة على كيفك',
    customFilterModalSubtitle: 'أنشئ زراً خاصاً بك لفلترة المعاملات فوراً بلمسة واحدة',
    customFilterNameLabel: 'اسم الفلتر / الكلمة الدلالية',
    customFilterPlaceholder: 'مثال: قهوة، بنزين، صيدلية، مطعم...',
    customFilterTypeLabel: 'نوع العمليات المستهدفة',
    customFilterCreateBtn: 'إنشاء الزر',
    deleteCustomFilterTitle: 'حذف الفلتر',
    deleteCustomFilterMessage: 'هل أنت متأكد من حذف هذا الفلتر المخصص؟',
    deleteFilterTitle: 'حذف الفلتر',
    deleteFilterMessage: 'هل أنت متأكد من رغبتك في حذف هذا الفلتر من القائمة؟',
    restoreFilters: 'استعادة الفلاتر',
    restoreFiltersConfirm: 'هل تريد استعادة جميع الفلاتر الافتراضية؟',

    // Calculation & Selection Feature
    calculate: 'CALCUL',
    calculateAction: 'حساب',
    selectMode: 'وضع التحديد',
    calculateFilterTotal: 'CALCUL Total',
    selectedItems: 'محددة',
    totalIncome: 'إجمالي المداخيل',
    totalExpenses: 'إجمالي المصاريف',
    netTotal: 'الصافي الإجمالي',
    selectAll: 'تحديد الكل',
    deselectAll: 'إلغاء التحديد',
    calculationTitle: 'الحساب المالي المخصص',
    filterCalculationTitle: 'مجموع العمليات المفلترة',
    noSelectionToCalculate: 'يرجى تحديد عملية واحدة على الأقل للاحتساب',
    surplus: 'فائض مالي',
    deficit: 'عجز مالي',
    balanced: 'متوازن',
    itemsCount: 'عملية',
    noTransactionsYet: 'لا توجد عمليات مضافة بعد',
    quickPresetsTitle: 'إجراءات سريعة',
    quickPresetsSubtitle: 'انقر على أي زر للإضافة للمحفظة فوراً بلمسة واحدة',
    newPreset: 'جديد',
    newPresetBtn: 'جديد',
    tapToAdd: 'نقرة للإضافة',
    noPresetsInFilter: 'لا توجد أزرار ثابتة في هذا التصنيف',
    createPresetNow: '+ أنشئ زراً الآن',

    // Quick Toast
    toastIncomeSuccess: 'تمت إضافة المبلغ للمحفظة بنجاح!',
    toastExpenseSuccess: 'تم تسجيل المصروف في المحفظة!',
    deleteTxSuccessToast: 'تم حذف المعاملة بنجاح',

    // Delete Transaction Modal
    deleteTxModalTitle: 'حذف المعاملة',
    deleteTxModalSubtitle: 'هل أنت متأكد من رغبتك في حذف هذه العملية نهائياً؟',
    deleteTxConfirmBtn: 'تأكيد',
    deleteTxBalanceNotice: 'سيتم تحديث رصيد محفظتك تلقائياً',

    // Edit Transaction Modal
    editTxModalTitle: 'تفاصيل وتعديل العملية',
    editTxModalSubtitle: 'يمكنك مراجعة وتعديل تفاصيل المعاملة المالية وحفظها فوراً',
    transactionDetails: 'تفاصيل العملية',
    saveChanges: 'حفظ التعديلات',
    saveChangesSuccess: 'تم تعديل العملية بنجاح!',
    transactionDate: 'تاريخ العملية',
    transactionType: 'نوع العملية',
    amountLabel: 'المبلغ',
    titleLabel: 'العنوان أو الوصف',
    categoryLabel: 'التصنيف',

    // Preset Modal
    modalAddPresetTitle: 'إضافة زر سريع جديد',
    modalAddPresetSubtitle: 'أنشئ زراً للإضافة بلمسة واحدة',
    modalEditPresetTitle: 'تعديل الزر السريع',
    modalEditPresetSubtitle: 'عدّل تفاصيل العملية الثابتة',
    fixedIncomeTab: 'مدخول ثابت (+)',
    fixedExpenseTab: 'مصروف ثابت (-)',
    presetNameLabel: 'اسم الزر / المصدر',
    presetNamePlaceholderIncome: 'مثال: Technotech',
    presetNamePlaceholderExpense: 'مثال: قهوة سريعة',
    presetAmountLabel: 'المبلغ الثابت',
    presetCategoryLabel: 'الفئة المرتبطة',
    presetIconLabel: 'أيقونة الزر',
    presetColorLabel: 'لون التمييز',
    presetPreviewLabel: 'معاينة الزر في الشاشة',
    createPresetBtn: 'إنشاء الزر الآن',
    saveChangesBtn: 'حفظ',
    deletePresetBtn: 'حذف',
    deletePresetConfirmTitle: 'تأكيد الحذف',
    deletePresetConfirmMsg: 'هل أنت متأكد من حذف هذا الزر؟',
    alertTitleRequired: 'يرجى كتابة اسم للزر (مثال: Technotech أو قهوة)',
    alertAmountInvalid: 'يرجى إدخال مبلغ صحيح أكبر من الصفر',
    customizationFull: 'تخصيص كامل',

    // Add Transaction Screen
    addTransactionTitle: 'إضافة عملية جديدة',
    txNameLabel: 'اسم العملية',
    txNamePlaceholder: 'مثال: مطعم شاورما هوس',
    txAmountLabel: 'المبلغ (د.ت)',
    txTypeLabel: 'نوع العملية',
    txCategoryLabel: 'الفئة',
    saveTransactionBtn: 'حفظ العملية',
    alertTxEmpty: 'يرجى إدخال اسم العملية والمبلغ بشكل صحيح',
    orAddWithVoice: 'أو أضف نفقاتك بالصوت',

    // Categories
    catFood: 'طعام',
    catTransport: 'نقل',
    catShopping: 'تسوق',
    catIncome: 'دخل',
    catEntertainment: 'ترفيه',
    catBills: 'فواتير',
    catWork: 'عمل',
    catOther: 'أخرى',

    // Explore / Stats Screen
    statsTitle: 'إحصائيات النفقات',
    categoryDistribution: 'توزيع الفئات',
    weeklySpending: 'الإنفاق الأسبوعي',
    categoryDetails: 'تفاصيل الفئات',
    noCategoriesYet: 'لا توجد فئات مضافة بعد',
    totalExpensesTitle: 'إجمالي المصاريف',
    expensesBreakdownTitle: 'توزيع المصاريف حسب الفئات',
    noExpensesYet: 'لا توجد مصاريف مسجلة بعد',
    percentage: 'النسبة',
    total: 'الإجمالي',
    mon: 'إثن',
    tue: 'ثلا',
    wed: 'أرب',
    thu: 'خمي',
    fri: 'جمع',
    sat: 'سبت',
    sun: 'أحد',

    // Income & Expenses Screens
    incomeHistoryTitle: 'سجل المقبوضات والدخل',
    expensesHistoryTitle: 'سجل المصاريف والنفقات',
    noIncomeYet: 'لا توجد مقبوضات مضافة بعد',

    // Voice Record Screen
    voiceRecordTitle: 'المساعد الصوتي المالي',
    voiceAssistant: 'المساعد الصوتي',
    voicePromptReady: 'اضغط على زر البدء لتسجيل المعاملة بصوتك',
    voiceMicStarting: 'جاري تشغيل الميكروفون...',
    voiceListening: 'جاري الاستماع... تحدث الآن بوضوح',
    voiceProcessing: 'جاري معالجة الصوت واستخلاص البيانات...',
    voiceNoSpeech: 'لم نتمكن من سماع أي كلام. حاول مجدداً.',
    voiceExtractionSuccess: 'تم استخلاص البيانات بنجاح! راجع العملية أدناه للقبول أو الرفض.',
    voiceAmountUnclear: 'لم نتمكن من تحديد المبلغ بدقة. حاول التحدث مجدداً.',
    voiceError: 'حدث خطأ أثناء معالجة الصوت. يرجى المحاولة مرة أخرى.',
    voiceMicPermissionError: 'لم يتم الحصول على صلاحية استخدام الميكروفون',
    voiceStopFailed: 'فشل إيقاف التسجيل',
    voiceStartFailed: 'فشل بدء التسجيل، حاول مجدداً',
    voiceNoAudioFile: 'فشل الحصول على ملف الصوت',
    extractedTxTitle: 'العملية المستخلصة بالذكاء الاصطناعي',
    acceptAndSave: 'قبول وحفظ في المحفظة',
    cancelTransaction: 'إلغاء وتجاهل',
    transcriptTitle: 'النص المسموع:',
    startVoiceRecording: 'بدء تسجيل الصوت',
    finishAndSave: 'إنهاء وحفظ',
    cancelRecording: 'إلغاء التسجيل',
    cancelAndRetry: 'إلغاء وإعادة',
    approveAndSave: 'موافقة وحفظ',
    reviewTxDetails: 'مراجعة تفاصيل العملية',
    spokenSpeech: 'الكلام المسموع',
    price: 'السعر',
    type: 'النوع',
    voiceStatusSaved: 'تم حفظ العملية وتحديث الرصيد!',
    voiceStatusCancelled: 'تم إلغاء العملية. يمكنك تسجيل صوتك مجدداً.',
    voiceStatusListening: 'جاري الاستماع...',
    voiceStatusAnalyzing: 'جاري التحليل...',

    // Language Modal
    selectLanguageTitle: 'اختر لغة التطبيق',
    selectLanguageSubtitle: 'اختر لغتك المفضلة لتطبيقها فوراً',
  },

  fr: {
    // General & Currency
    currency: 'DT',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    confirm: 'Confirmer',
    all: 'Tous',
    back: 'Retour',
    greeting: 'Bienvenue',
    appTitle: 'STOUCH',

    // Home Screen
    totalBalance: 'Solde Total',
    mainWallet: 'Portefeuille Principal',
    expenses: 'Dépenses',
    income: 'Revenus',
    recentTransactions: 'Activité',
    searchPlaceholder: 'Rechercher...',
    noSearchResults: 'Aucun résultat trouvé',
    clearFilter: 'Réinitialiser',
    addCustomFilter: 'Filtre perso',
    customFilterModalTitle: 'Filtre Sur-Mesure',
    customFilterModalSubtitle: 'Créez un bouton personnalisé pour filtrer vos opérations',
    customFilterNameLabel: 'Nom du filtre / Mot-clé',
    customFilterPlaceholder: 'Ex: Café, Carburant, Pharmacie, Netflix...',
    customFilterTypeLabel: 'Type d\'opérations ciblées',
    customFilterCreateBtn: 'Créer le bouton',
    deleteCustomFilterTitle: 'Supprimer le filtre',
    deleteCustomFilterMessage: 'Voulez-vous supprimer ce bouton de filtre personnalisé ?',
    deleteFilterTitle: 'Supprimer le filtre',
    deleteFilterMessage: 'Voulez-vous supprimer ce filtre de la liste ?',
    restoreFilters: 'Restaurer les filtres',
    restoreFiltersConfirm: 'Voulez-vous restaurer tous les filtres par défaut ?',

    // Calculation & Selection Feature
    calculate: 'CALCUL',
    calculateAction: 'Calculer',
    selectMode: 'Mode Sélection',
    calculateFilterTotal: 'CALCUL Total',
    selectedItems: 'sélectionnée(s)',
    totalIncome: 'Total Revenus',
    totalExpenses: 'Total Dépenses',
    netTotal: 'Total Net',
    selectAll: 'Tout sélectionner',
    deselectAll: 'Désélectionner',
    calculationTitle: 'Bilan du Calcul',
    filterCalculationTitle: 'Total du Filtre',
    noSelectionToCalculate: 'Veuillez sélectionner au moins une transaction',
    surplus: 'Excédent',
    deficit: 'Déficit',
    balanced: 'Équilibré',
    itemsCount: 'opération(s)',
    noTransactionsYet: 'Aucune transaction pour le moment',
    quickPresetsTitle: 'Raccourcis',
    quickPresetsSubtitle: 'Appuyez pour ajouter instantanément au portefeuille',
    newPreset: 'Nouveau',
    newPresetBtn: 'Nouveau',
    tapToAdd: 'Appuyer pour ajouter',
    noPresetsInFilter: 'Aucun raccourci dans cette catégorie',
    createPresetNow: '+ Créer un raccourci',

    // Quick Toast
    toastIncomeSuccess: 'Montant ajouté avec succès au portefeuille !',
    toastExpenseSuccess: 'Dépense enregistrée dans le portefeuille !',
    deleteTxSuccessToast: 'Transaction supprimée avec succès',

    // Delete Transaction Modal
    deleteTxModalTitle: 'Supprimer la transaction',
    deleteTxModalSubtitle: 'Êtes-vous sûr de vouloir supprimer définitivement cette opération ?',
    deleteTxConfirmBtn: 'Confirmer',
    deleteTxBalanceNotice: 'Le solde de votre portefeuille sera recalculé automatiquement',

    // Edit Transaction Modal
    editTxModalTitle: 'Détails & Modification',
    editTxModalSubtitle: 'Modifiez les détails de cette opération et enregistrez-les',
    transactionDetails: 'Détails de l\'opération',
    saveChanges: 'Enregistrer les modifications',
    saveChangesSuccess: 'Opération modifiée avec succès !',
    transactionDate: 'Date de l\'opération',
    transactionType: 'Type d\'opération',
    amountLabel: 'Montant',
    titleLabel: 'Titre ou description',
    categoryLabel: 'Catégorie',

    // Preset Modal
    modalAddPresetTitle: 'Nouveau Bouton Rapide',
    modalAddPresetSubtitle: 'Créez un bouton pour ajouter en un clic',
    modalEditPresetTitle: 'Modifier le Bouton Rapide',
    modalEditPresetSubtitle: 'Modifiez les détails de cette action fixe',
    fixedIncomeTab: 'Revenu Fixe (+)',
    fixedExpenseTab: 'Dépense Fixe (-)',
    presetNameLabel: 'Nom du Bouton / Source',
    presetNamePlaceholderIncome: 'Ex: Technotech',
    presetNamePlaceholderExpense: 'Ex: Café du matin',
    presetAmountLabel: 'Montant Fixe',
    presetCategoryLabel: 'Catégorie associée',
    presetIconLabel: 'Icône du bouton',
    presetColorLabel: 'Couleur distinctive',
    presetPreviewLabel: 'Aperçu du bouton',
    createPresetBtn: 'Créer le bouton maintenant',
    saveChangesBtn: 'Enregistrer',
    deletePresetBtn: 'Supprimer',
    deletePresetConfirmTitle: 'Confirmation de suppression',
    deletePresetConfirmMsg: 'Êtes-vous sûr de vouloir supprimer ce bouton ?',
    alertTitleRequired: 'Veuillez saisir un nom pour le bouton (ex: Technotech ou Café)',
    alertAmountInvalid: 'Veuillez saisir un montant valide supérieur à zéro',
    customizationFull: 'Personnaliser',

    // Add Transaction Screen
    addTransactionTitle: 'Ajouter une Transaction',
    txNameLabel: 'Nom de la Transaction',
    txNamePlaceholder: 'Ex: Restaurant Déjeuner',
    txAmountLabel: 'Montant (DT)',
    txTypeLabel: 'Type de Transaction',
    txCategoryLabel: 'Catégorie',
    saveTransactionBtn: 'Enregistrer la transaction',
    alertTxEmpty: 'Veuillez saisir un titre et un montant valide',
    orAddWithVoice: 'Ou ajoutez par la voix',

    // Categories
    catFood: 'Alimentation',
    catTransport: 'Transport',
    catShopping: 'Shopping',
    catIncome: 'Revenu',
    catEntertainment: 'Loisirs',
    catBills: 'Factures',
    catWork: 'Travail',
    catOther: 'Autre',

    // Explore / Stats Screen
    statsTitle: 'Statistiques des Dépenses',
    categoryDistribution: 'Répartition des Catégories',
    weeklySpending: 'Dépenses Hebdomadaires',
    categoryDetails: 'Détails des Catégories',
    noCategoriesYet: 'Aucune catégorie enregistrée',
    totalExpensesTitle: 'Total des Dépenses',
    expensesBreakdownTitle: 'Répartition des Dépenses par Catégorie',
    noExpensesYet: 'Aucune dépense enregistrée',
    percentage: 'Part',
    total: 'Total',
    mon: 'Lun',
    tue: 'Mar',
    wed: 'Mer',
    thu: 'Jeu',
    fri: 'Ven',
    sat: 'Sam',
    sun: 'Dim',

    // Income & Expenses Screens
    incomeHistoryTitle: 'Historique des Revenus',
    expensesHistoryTitle: 'Historique des Dépenses',
    noIncomeYet: 'Aucun revenu enregistré pour le moment',

    // Voice Record Screen
    voiceRecordTitle: 'Assistant Vocal Financier',
    voiceAssistant: 'Assistant Vocal',
    voicePromptReady: 'Appuyez pour enregistrer votre transaction par la voix',
    voiceMicStarting: 'Démarrage du microphone...',
    voiceListening: 'À l\'écoute... Parlez clairement maintenant',
    voiceProcessing: 'Traitement vocal et extraction des données...',
    voiceNoSpeech: 'Aucune parole détectée. Veuillez réessayer.',
    voiceExtractionSuccess: 'Données extraites avec succès ! Vérifiez ci-dessous.',
    voiceAmountUnclear: 'Impossible de détecter le montant précisément. Réessayez.',
    voiceError: 'Une erreur s\'est produite lors du traitement vocal. Réessayez.',
    voiceMicPermissionError: 'Permission du microphone refusée',
    voiceStopFailed: 'Échec de l\'arrêt de l\'enregistrement',
    voiceStartFailed: 'Échec du démarrage de l\'enregistrement',
    voiceNoAudioFile: 'Fichier audio introuvable',
    extractedTxTitle: 'Transaction extraite par l\'IA',
    acceptAndSave: 'Approuver et Enregistrer',
    cancelTransaction: 'Annuler et Ignorer',
    transcriptTitle: 'Texte transcrit :',
    startVoiceRecording: 'Démarrer l\'enregistrement',
    finishAndSave: 'Terminer et Enregistrer',
    cancelRecording: 'Annuler l\'enregistrement',
    cancelAndRetry: 'Annuler et Réessayer',
    approveAndSave: 'Approuver et Enregistrer',
    reviewTxDetails: 'Détails de la transaction',
    spokenSpeech: 'Paroles entendues',
    price: 'Montant',
    type: 'Type',
    voiceStatusSaved: 'Transaction enregistrée avec succès !',
    voiceStatusCancelled: 'Transaction annulée. Vous pouvez réessayer.',
    voiceStatusListening: 'À l\'écoute...',
    voiceStatusAnalyzing: 'Analyse en cours...',

    // Language Modal
    selectLanguageTitle: 'Choisir la langue de l\'application',
    selectLanguageSubtitle: 'Choisissez votre langue préférée instantanément',
  },

  en: {
    // General & Currency
    currency: 'DT',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    all: 'All',
    back: 'Back',
    greeting: 'Welcome',
    appTitle: 'STOUCH',

    // Home Screen
    totalBalance: 'Total Balance',
    mainWallet: 'Main Wallet',
    expenses: 'Expenses',
    income: 'Income',
    recentTransactions: 'Recent Transactions',
    searchPlaceholder: 'Search...',
    noSearchResults: 'No matching results',
    clearFilter: 'Reset',
    addCustomFilter: 'Custom Filter',
    customFilterModalTitle: 'Custom Filter Button',
    customFilterModalSubtitle: 'Create your own custom button to filter transactions instantly',
    customFilterNameLabel: 'Filter name / keyword',
    customFilterPlaceholder: 'Ex: Coffee, Fuel, Pharmacy, Netflix...',
    customFilterTypeLabel: 'Target transaction type',
    customFilterCreateBtn: 'Create Button',
    deleteCustomFilterTitle: 'Delete Filter',
    deleteCustomFilterMessage: 'Are you sure you want to delete this custom filter?',
    deleteFilterTitle: 'Delete Filter',
    deleteFilterMessage: 'Are you sure you want to remove this filter from the list?',
    restoreFilters: 'Restore Filters',
    restoreFiltersConfirm: 'Do you want to restore all default filters?',

    // Calculation & Selection Feature
    calculate: 'CALCUL',
    calculateAction: 'Calculate',
    selectMode: 'Select Mode',
    calculateFilterTotal: 'CALCUL Total',
    selectedItems: 'selected',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    netTotal: 'Net Total',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    calculationTitle: 'Calculation Summary',
    filterCalculationTitle: 'Filtered Total',
    noSelectionToCalculate: 'Please select at least one transaction to calculate',
    surplus: 'Surplus',
    deficit: 'Deficit',
    balanced: 'Balanced',
    itemsCount: 'transaction(s)',
    noTransactionsYet: 'No transactions added yet',
    quickPresetsTitle: 'Shortcuts',
    quickPresetsSubtitle: 'Tap any button to add instantly to your wallet with one touch',
    newPreset: 'New',
    newPresetBtn: 'New',
    tapToAdd: 'Tap to add',
    noPresetsInFilter: 'No presets found in this category',
    createPresetNow: '+ Create a Preset',

    // Quick Toast
    toastIncomeSuccess: 'Amount added successfully to wallet!',
    toastExpenseSuccess: 'Expense recorded in wallet!',
    deleteTxSuccessToast: 'Transaction deleted successfully',

    // Delete Transaction Modal
    deleteTxModalTitle: 'Delete Transaction',
    deleteTxModalSubtitle: 'Are you sure you want to permanently delete this transaction?',
    deleteTxConfirmBtn: 'Confirm',
    deleteTxBalanceNotice: 'Your wallet balance will be recalculated automatically',

    // Edit Transaction Modal
    editTxModalTitle: 'Details & Edit',
    editTxModalSubtitle: 'Update any details of this transaction and save changes',
    transactionDetails: 'Transaction Details',
    saveChanges: 'Save Changes',
    saveChangesSuccess: 'Transaction updated successfully!',
    transactionDate: 'Transaction Date',
    transactionType: 'Transaction Type',
    amountLabel: 'Amount',
    titleLabel: 'Title or description',
    categoryLabel: 'Category',

    // Preset Modal
    modalAddPresetTitle: 'New Quick Preset',
    modalAddPresetSubtitle: 'Create a one-tap action button',
    modalEditPresetTitle: 'Edit Quick Preset',
    modalEditPresetSubtitle: 'Modify details for this fixed action',
    fixedIncomeTab: 'Fixed Income (+)',
    fixedExpenseTab: 'Fixed Expense (-)',
    presetNameLabel: 'Preset Name / Source',
    presetNamePlaceholderIncome: 'e.g. Technotech',
    presetNamePlaceholderExpense: 'e.g. Morning Coffee',
    presetAmountLabel: 'Fixed Amount',
    presetCategoryLabel: 'Associated Category',
    presetIconLabel: 'Button Icon',
    presetColorLabel: 'Accent Color',
    presetPreviewLabel: 'Button Preview',
    createPresetBtn: 'Create Preset Now',
    saveChangesBtn: 'Save',
    deletePresetBtn: 'Delete',
    deletePresetConfirmTitle: 'Confirm Delete',
    deletePresetConfirmMsg: 'Are you sure you want to delete this preset?',
    alertTitleRequired: 'Please provide a name for the button (e.g. Technotech or Coffee)',
    alertAmountInvalid: 'Please enter a valid amount greater than zero',
    customizationFull: 'Full Customization',

    // Add Transaction Screen
    addTransactionTitle: 'Add New Transaction',
    txNameLabel: 'Transaction Name',
    txNamePlaceholder: 'e.g. Burger Lunch',
    txAmountLabel: 'Amount (DT)',
    txTypeLabel: 'Transaction Type',
    txCategoryLabel: 'Category',
    saveTransactionBtn: 'Save Transaction',
    alertTxEmpty: 'Please enter a valid title and amount',
    orAddWithVoice: 'Or add with voice',

    // Categories
    catFood: 'Food',
    catTransport: 'Transport',
    catShopping: 'Shopping',
    catIncome: 'Income',
    catEntertainment: 'Entertainment',
    catBills: 'Bills',
    catWork: 'Work',
    catOther: 'Other',

    // Explore / Stats Screen
    statsTitle: 'Expense Statistics',
    categoryDistribution: 'Category Distribution',
    weeklySpending: 'Weekly Spending',
    categoryDetails: 'Category Details',
    noCategoriesYet: 'No categories recorded yet',
    totalExpensesTitle: 'Total Expenses',
    expensesBreakdownTitle: 'Expenses Breakdown by Category',
    noExpensesYet: 'No expenses recorded yet',
    percentage: 'Share',
    total: 'Total',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',

    // Income & Expenses Screens
    incomeHistoryTitle: 'Income & Receipts History',
    expensesHistoryTitle: 'Expenses & Spending History',
    noIncomeYet: 'No income recorded yet',

    // Voice Record Screen
    voiceRecordTitle: 'Voice AI Finance Assistant',
    voiceAssistant: 'Voice Assistant',
    voicePromptReady: 'Tap start to record your transaction with your voice',
    voiceMicStarting: 'Starting microphone...',
    voiceListening: 'Listening... Speak clearly now',
    voiceProcessing: 'Processing voice and extracting data...',
    voiceNoSpeech: 'No speech detected. Please try again.',
    voiceExtractionSuccess: 'Data extracted successfully! Review below.',
    voiceAmountUnclear: 'Could not detect the amount clearly. Please try again.',
    voiceError: 'An error occurred while processing voice. Please try again.',
    voiceMicPermissionError: 'Microphone permission not granted',
    voiceStopFailed: 'Failed to stop recording',
    voiceStartFailed: 'Failed to start recording',
    voiceNoAudioFile: 'Audio file not found',
    extractedTxTitle: 'AI Extracted Transaction',
    acceptAndSave: 'Approve & Save',
    cancelTransaction: 'Cancel & Discard',
    transcriptTitle: 'Transcribed Text:',
    startVoiceRecording: 'Start Voice Recording',
    finishAndSave: 'Finish & Save',
    cancelRecording: 'Cancel Recording',
    cancelAndRetry: 'Cancel & Retry',
    approveAndSave: 'Approve & Save',
    reviewTxDetails: 'Review Transaction Details',
    spokenSpeech: 'Heard Speech',
    price: 'Amount',
    type: 'Type',
    voiceStatusSaved: 'Transaction saved and balance updated!',
    voiceStatusCancelled: 'Transaction cancelled. You can record again.',
    voiceStatusListening: 'Listening...',
    voiceStatusAnalyzing: 'Analyzing...',

    // Language Modal
    selectLanguageTitle: 'Select App Language',
    selectLanguageSubtitle: 'Choose your preferred language instantly',
  },
};

export const getCategoryLabel = (category: string, t: (key: string, def?: string) => string): string => {
  if (!category) return '';
  const lower = category.toLowerCase().trim();
  if (lower === 'طعام' || lower === 'food' || lower === 'alimentation' || lower === 'nourriture' || lower === 'catfood') return t('catFood');
  if (lower === 'نقل' || lower === 'transport' || lower === 'cattransport') return t('catTransport');
  if (lower === 'تسوق' || lower === 'shopping' || lower === 'catshopping') return t('catShopping');
  if (lower === 'دخل' || lower === 'income' || lower === 'revenu' || lower === 'catincome') return t('catIncome');
  if (lower === 'ترفيه' || lower === 'entertainment' || lower === 'loisirs' || lower === 'catentertainment') return t('catEntertainment');
  if (lower === 'فواتير' || lower === 'bills' || lower === 'factures' || lower === 'catbills') return t('catBills');
  if (lower === 'عمل' || lower === 'work' || lower === 'travail' || lower === 'catwork') return t('catWork');
  if (lower === 'أخرى' || lower === 'other' || lower === 'autre' || lower === 'catother') return t('catOther');
  return category;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, defaultText?: string) => string;
  isRTL: boolean;
  currency: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem('@app_language');
        if (stored && (stored === 'ar' || stored === 'fr' || stored === 'en')) {
          setLanguageState(stored as Language);
        }
      } catch (e) {
        console.error('Failed to load saved language', e);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem('@app_language', newLang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const currentDict = translations[language] || translations.ar;
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to Arabic if missing
    if (translations.ar[key]) {
      return translations.ar[key];
    }
    return defaultText || key;
  };

  const isRTL = language === 'ar';
  const currency = translations[language]?.currency || 'د.ت';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, currency }}>
      {children}
    </LanguageContext.Provider>
  );
};
