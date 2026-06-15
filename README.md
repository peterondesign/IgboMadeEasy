# IgboMadeEasy

IgboMadeEasy is an Expo React Native app for Igbo language learning, including lessons, story mode audio, notifications, and premium subscriptions.

## Prerequisites

- Node 22.13.0 (see .nvmrc)
- Xcode for iOS builds
- EAS account access for project owner petedgt

## Local development

1. Install dependencies.
2. Start the app.

```bash
npm install
npm run start:node22
```

## Production preflight

Run this before any production build:

```bash
npm run preflight
```

Preflight checks:

- TypeScript compile validation
- Expo doctor checks

## Production build commands

```bash
# iOS
npm run build:production:ios

# Android
npm run build:production:android
```

## Production submit commands

```bash
# iOS
npm run submit:production:ios

# Android
npm run submit:production:android
```

## Required production environment variables

- EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
- EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID

Set values in EAS project environment (production) before running production builds.

## Store metadata notes

- iOS bundle identifier: com.igbomadeeasy.app
- Android package: com.igbomadeeasy.app
- OTA updates URL is configured through EAS project ID
- appVersion is used as runtimeVersion policy

## iOS subscription submission checklist

Before submitting any iOS build that includes subscriptions:

- Ensure both Product IDs exist exactly as:
	- premium_annual_igbo_easy
	- premium_monthly_igbo_easy
- Complete required subscription metadata in App Store Connect (display name, description, pricing, screenshot, and localization).
- For the first subscription submission: upload a new binary, open that app version, then add at least one subscription in In-App Purchases and Subscriptions before submitting for App Review.
- After the first subscription has been submitted with a binary, additional subscriptions can be submitted directly from the Subscriptions section.
