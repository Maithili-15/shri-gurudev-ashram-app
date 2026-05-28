# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Project Safety Rules

- Keep `index.ts` as the only runtime entry and import side effects there before `expo-router/entry`.
- Do not add new direct `@react-navigation/*` usage to route files; keep navigation code isolated in `src/` shells.
- Keep `app/` route files thin and route-centric; place screens, services, state, and business logic under `src/`.
- Use only stable SDK-compatible package versions; update dependencies through `expo install` or a controlled lockfile refresh.
- Keep custom utility tokens in `global.css` and `tailwind.config.js`; do not scatter magic class names in components.
- Preserve `react-native-reanimated` and `react-native-gesture-handler` side effects in the entry file.
- When adding new imports, prefer absolute `@/*` aliases for `src/` and avoid deep relative chains.
- Keep `newArchEnabled` disabled unless a full compatibility pass has been completed.
