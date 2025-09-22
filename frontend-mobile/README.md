# Kural Frontend Mobile (Expo React Native)

This is a base Expo React Native app for authentication with the Kural backend API.

## Features
- Expo managed workflow
- Authentication screens (Login, Register, Forgot Password)
- API service layer and config
- React Navigation (Stack)
- AsyncStorage for token management

## Getting Started

1. Install dependencies:
   ```sh
   npm install -g expo-cli
   npm install
   ```
2. Start the Expo app:
   ```sh
   expo start
   ```
3. Update `src/config/api.js` with your backend URL if needed.

## Project Structure

- `App.js` - Entry point
- `src/screens/auth/` - Auth screens
- `src/services/` - API and auth services
- `src/config/` - API config
- `src/components/` - Reusable components
- `src/context/` - Context providers (future)
- `src/navigation/` - Navigation setup
- `src/utils/` - Utility functions
- `src/constants/` - App constants
- `src/styles/` - Common styles
- `assets/` - App images/icons

## Expo Managed Workflow
- All required Expo files are included: `app.json`, `App.js`, `babel.config.js`.
- You can add assets (icon, splash, etc.) in the `assets/` folder.

---

For more, see the backend README for API endpoints and usage.
