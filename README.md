# 💳 STOUCH — Gestionnaire Financier & Suivi des Dépenses

<div align="center">
  <img src="assets/images/logo.png" alt="STOUCH Logo" width="160" />

  <p><strong>Application mobile moderne, élégante et intelligente pour la gestion des finances personnelles</strong></p>
  <p><em>Smart, elegant personal finance management built with Expo SDK 57 & React Native</em></p>

  [![Expo SDK](https://img.shields.io/badge/Expo-v57.0.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
  [![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
</div>

---

## 🇫🇷 Description du Projet (Français)

**STOUCH** est une application mobile financière de pointe conçue pour simplifier la gestion quotidienne de vos revenus et dépenses. Alliant une esthétique Fintech luxueuse et contemporaine à des performances ultra-rapides, STOUCH intègre des fonctionnalités avancées telles que le suivi des revenus en attente (cartes jaunes), la sélection multiple fluide par appui long, le calcul financier instantané, la saisie vocale intelligente et le support multilingue complet (Arabe RTL, Français, Anglais).

---

## ✨ Fonctionnalités Principales

- 💰 **Gestion Intelligente du Solde & Revenus en Attente** :
  - Suivi en temps réel du solde total disponible.
  - Enregistrement des revenus perçus ou **en attente d'encaissement** (mis en valeur par un design de **carte jaune** distinctif avec bordure dorée).
  - Les revenus en attente ne faussent pas votre solde réel tant qu'ils ne sont pas confirmés.
- 👆 **Sélection Multiple Intuitive (Multi-Select)** :
  - **Activation par appui long (1 seconde)** sur n'importe quelle carte pour entrer en mode sélection.
  - Sélection ou désélection des cartes suivantes d'un **simple clic**.
  - **Barre d'actions flottante** :
    - 🧮 **CALCUL** : Bilan financier instantané avec total des revenus, des dépenses et solde net de la sélection.
    - ⏳ **En attente** : Passage direct du statut en attente (carte jaune) sans pop-up intempestif.
    - ✅ **Reçu** : Validation immédiate de l'encaissement et mise à jour automatique du solde.
    - 🗑️ **Suppression groupée** : Suppression instantanée et fluide des éléments sélectionnés.
- ⚡ **Raccourcis Préréglés (Quick Presets)** :
  - Boutons personnalisables en un clic pour ajouter vos dépenses et revenus récurrents (Café, Carburant, Salaire, etc.).
- 📝 **Modification & Ajustement des Transactions** :
  - Modal dédié permettant d'ajuster le montant, la description, la catégorie et le statut d'encaissement de chaque transaction.
- 🎙️ **Saisie Vocale Assistée par IA** :
  - Enregistrement rapide des transactions à la voix grâce à `expo-audio`.
- 🌓 **Design Luxueux & Thème Double (Dark / Light)** :
  - Palette haut de gamme (Obsidian Royal, Or Liquide, Émeraude et Saphir).
  - Effets glassmorphiques, transitions animées et retours haptiques fluides (`expo-haptics`).
- 🌍 **Support Multilingue & RTL Intégral** :
  - Arabe 🇹🇳 (avec alignement RTL natif).
  - Français 🇫🇷.
  - Anglais 🇬🇧.
- 🔍 **Filtres Avancés & Recherche Instantanée** :
  - Recherche en temps réel et création de filtres personnalisés.

---

## 🚀 Guide d'Installation et d'Exécution

### 1. Prérequis
Assurez-vous d'avoir installé sur votre machine :
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [Git](https://git-scm.com/)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- L'application mobile [Expo Go](https://expo.dev/go) installée sur votre smartphone (iOS ou Android) OU un émulateur configuré (Android Studio / Xcode).

### 2. Cloner le Dépôt
```bash
git clone https://github.com/khalil-mejri-1/stouch.git
cd stouch
```

### 3. Installer les Dépendances
```bash
npm install
```

### 4. Lancer le Serveur de Développement
```bash
npx expo start
```

### 5. Ouvrir l'Application
- **Sur Téléphone Physique** :
  - Scannez le QR Code affiché dans le terminal ou l'interface Metro avec l'application **Expo Go** (sur Android) ou l'application **Appareil photo** (sur iOS).
- **Sur Émulateur Android** :
  - Appuyez sur la touche `a` dans le terminal.
- **Sur Simulateur iOS (macOS)** :
  - Appuyez sur la touche `i` dans le terminal.
- **Pour recharger l'application** :
  - Appuyez sur la touche `r` dans le terminal.

---

## 🛠️ Stack Technologique

- **Framework** : [Expo SDK 57](https://expo.dev)
- **Cœur** : [React Native 0.86](https://reactnative.dev) & React 19
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Navigation** : [Expo Router](https://docs.expo.dev/router/introduction/) (Routage basé sur les fichiers)
- **Gestion d'état** : React Context API (`TransactionsContext`, `LanguageContext`, `ThemeContext`)
- **Stockage Local** : `@react-native-async-storage/async-storage`
- **Animations & Haptique** : `react-native-reanimated`, `Animated`, `expo-haptics`
- **Audio** : `expo-audio`
- **Design & Typographie** : `@expo-google-fonts/outfit`, `@expo/vector-icons`

---

## 📁 Structure du Projet

```
stouch/
├── app/                  # Pages et navigation (Expo Router)
│   ├── (tabs)/           # Onglets principaux (Accueil, Statistiques)
│   ├── add-transaction.tsx # Écran d'ajout manuel
│   ├── expenses.tsx      # Historique détaillé des dépenses
│   ├── income.tsx        # Historique détaillé des revenus
│   └── record.tsx        # Enregistrement vocal
├── assets/               # Images, logos, icônes et polices
├── components/           # Composants UI modulaires
│   ├── AnimatedTransactionCard.tsx  # Carte de transaction avec sélection & état jaune
│   ├── EditTransactionModal.tsx     # Modal de modification des opérations
│   ├── CalculationModal.tsx         # Modal de bilan calculé
│   ├── QuickPresetsSection.tsx      # Raccourcis rapides
│   └── ...
├── context/              # Contextes globaux (Transactions, Langues, Thèmes)
├── hooks/                # Hooks personnalisés
└── constants/            # Constantes de couleurs et styles
```

---

## 👨‍💻 Auteur

**Khalil Mejri**  
GitHub : [@khalil-mejri-1](https://github.com/khalil-mejri-1)

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
