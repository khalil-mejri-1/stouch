# 💳 STOUCH — Smart Personal Finance & Expense Tracker

<div align="center">
  <img src="assets/images/logo.png" alt="STOUCH Logo" width="160" />

  <p><strong>تطبيق إدارة المصاريف والمداخيل الشخصية الذكي والأنيق</strong></p>
  <p><em>Smart, elegant personal finance management built with Expo SDK 57 & React Native</em></p>

  [![Expo SDK](https://img.shields.io/badge/Expo-v57.0.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
</div>

---

## 🌟 Overview | نظرة عامة

**STOUCH** هو تطبيق هاتف ذكي متطور لإدارة المصاريف والمداخيل اليومية، صُمم ليجمع بين الأداء الفائق والواجهات العصرية الفاخرة (Fintech Aesthetics)، مع دعم كامل للغات المتعددة والتسجيل الصوتي السريع للمعاملات.

**STOUCH** is a modern, high-performance personal expense and income tracker designed with a luxury fintech user experience, full multi-language support (Arabic RTL, French, English), and smart quick-action presets.

---

## ✨ Key Features | أبرز الميزات

- 📊 **إدارة الميزانية الذكية (Smart Financial Tracking)**: متابعة فورية لإجمالي الرصيد، والمصاريف، والمداخيل بدقة متناهية.
- ⚡ **الاختصارات السريعة (Quick Presets / Raccourcis)**: بطاقات تفاعلية ذكية لتسجيل النفقات اليومية المتكررة (مثل القهوة، البنزين، المشتريات) بلمسة واحدة.
- 🎙️ **التسجيل الصوتي (Voice Transaction Recording)**: إدخال المعاملات صوتياً باستخدام أحدث مكتبات الصوتيات `expo-audio`.
- 🧮 **آلة حاسبة ذكية متعددة التحديد (Multi-Select Calculator - CALCUL)**:
  - إمكانية تحديد عدة معاملات في قسم الأنشطة واحتساب مجموعها بضغطة زر.
  - احتساب إجمالي المعاملات المفلترة فورياً.
- 🎨 **تصميم عصري فخم (Ultra-Premium UI)**:
  - دعم كامل للوضعين الداكن (Dark Mode) والفاتح (Light Mode).
  - تأثيرات زجاجية وتدرجات لونية عصرية (Glassmorphism & Gradients).
  - استجابة لمسية واهتزازات تفاعلية ناعمة (Haptic Feedback).
- 🌍 **دعم لغوي متكامل (Multi-Language & Full RTL)**:
  - العربية (تونس) 🇹🇳 مع دعم كامل للاتجاه من اليمين إلى اليسار (RTL).
  - Français 🇫🇷
  - English 🇬🇧
- 🔍 **فلاتر وبحث مخصص (Custom Filters & Search)**: بحث سريع وإمكانية إنشاء أزرار فلترة مخصصة حسب الحاجة مع خيار الحذف والاستعادة.

---

## 🛠️ Tech Stack | التقنيات المستخدمة

- **Framework**: [Expo](https://expo.dev) SDK 57 (Managed Workflow)
- **Core**: [React Native](https://reactnative.dev) 0.86.3 / React 19.2
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Audio & Media**: `expo-audio`, `expo-image`
- **Animations & Gestures**: `react-native-reanimated`, `expo-haptics`
- **Typography**: `@expo-google-fonts/outfit`
- **Storage**: `@react-native-async-storage/async-storage`

---

## 🚀 Getting Started | طريقة التشغيل

### 1. المتطلبات الأولية (Prerequisites)
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Git](https://git-scm.com/)
- تطبيق [Expo Go](https://expo.dev/go) على هاتفك أو محاكي Android / iOS.

### 2. تثبيت الحزم (Installation)
```bash
# Clone the repository
git clone https://github.com/khalil-mejri-1/stouch.git

# Navigate into project directory
cd stouch

# Install dependencies
npm install
```

### 3. تشغيل التطبيق محلياً (Run Locally)
```bash
# Start the Expo development server
npx expo start
```
- اضغط `a` لفتح محاكي Android
- اضغط `i` لفتح محاكي iOS
- امسح رمز الـ QR عبر تطبيق **Expo Go** لتشغيله مباشرة على هاتفك.

---

## 📱 Project Structure | هيكلة المشروع

```
stouch/
├── app/                  # شاشات ومسارات التطبيق (Expo Router)
│   ├── (tabs)/           # الشاشات الرئيسية (الرئيسية، التقرير، إلخ)
│   ├── add-transaction.tsx
│   ├── expenses.tsx
│   ├── income.tsx
│   └── record.tsx        # التسجيل الصوتي
├── assets/               # الأصول (أيقونات، خطوط Outfit، صور الشعار)
├── components/           # المكونات القابلة لإعادة الاستخدام (Modals, Cards, Widgets)
├── context/              # إدارة الحالة العامة (Language, Theme, Transactions)
├── hooks/                # الخطافات المخصصة (Custom React Hooks)
└── constants/            # الثوابت والألوان
```

---

## 👨‍💻 Author

**Khalil Mejri**  
GitHub: [@khalil-mejri-1](https://github.com/khalil-mejri-1)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
