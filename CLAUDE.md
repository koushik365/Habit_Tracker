# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm start            # Expo dev server — scan QR with Expo Go on a physical device
npm run ios          # Launch iOS simulator
npm run android      # Launch Android emulator
npm run web          # Open in web browser (Metro bundler)
npx expo start --clear  # Full cache purge — use after renaming files or dependency changes
```

There is no test runner configured.

## Architecture

### Routing
Expo Router file-based routing. The `app/` directory is **exclusively** for screens and layout — no business logic belongs here. Never use a root `App.tsx`; the entry point is `app/_layout.tsx`.

Two tabs defined in `app/_layout.tsx`:
- `app/index.tsx` — Today screen (daily check-off view with week strip)
- `app/habits.tsx` — All Habits screen (full list with delete and stats)

### State & Persistence
There is no external state manager. `src/hooks/useHabits.ts` is the single source of truth — it loads both `Habit[]` and `HabitLog[]` from AsyncStorage on mount, keeps them in React state, and writes the full array back to AsyncStorage on every mutation.

`src/store/storage.ts` is the only persistence layer. Keys:
- `habit_tracker:habits` — serialized `Habit[]`
- `habit_tracker:logs` — serialized `HabitLog[]`

### Data Model (`src/types/index.ts`)
- `Habit` — static definition (name, icon, color, frequency, `archivedAt?`)
- `HabitLog` — one record per completion (`habitId`, `completedAt` ISO string)

Logs are matched to habits by `habitId`. Date matching uses ISO string prefix: `log.completedAt.startsWith('YYYY-MM-DD')`. Streak and completion counts are computed on-demand in screens from the raw logs array — nothing is pre-computed or stored.

### Design System
All tokens are in `src/constants/theme.ts` — `Colors`, `Spacing`, `BorderRadius`, `FontSize`. Components currently use hard-coded hex values inline (not the tokens); prefer migrating to tokens when touching a component.

Color palette:
- Background: `#0F0F1A`, Surface: `#1A1A2E`, Elevated surface: `#22223B`
- Primary accent: `#6C5CE7` (purple), Secondary: `#00CEC9` (teal)

**Glassmorphism:** Transparency is emulated with `rgba(255,255,255,0.05)` backgrounds and `rgba(255,255,255,0.06–0.08)` borders — not actual blur. This is the established pattern for overlays, cards, and modals throughout the app.

**Animations:** React Native Reanimated (`useSharedValue`, `withSpring`) is the target animation library. Current `HabitCard` uses the legacy `Animated` API from React Native — new animated components should use Reanimated. Animations must degrade gracefully on low-end Android and older web browsers.

### TypeScript Path Aliases
Configured in `tsconfig.json`:
```
@/*           → src/*
@components/* → src/components/*
@hooks/*      → src/hooks/*
@store/*      → src/store/*
@utils/*      → src/utils/*
@constants/*  → src/constants/*
@types/*      → src/types/*
```

## Multi-Platform Rules

Every feature must work on iOS, Android, and Web.

**Shadows:** iOS/Web use `shadowColor/Offset/Opacity/Radius`; Android uses `elevation`. Declare both.

**Keyboard:** Wrap input forms in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`.

**Safe areas:** Root layout wraps in `<SafeAreaProvider>`; screens use `<SafeAreaView edges={['top']}>` from `react-native-safe-area-context`.

**Android back button:** Modals must intercept `BackHandler` to close instead of exiting the app.

**Buttons:** Use `TouchableOpacity` with `activeOpacity` for cross-platform tap feedback. For Android-native ripple effects, use `Pressable` with the `android_ripple` prop.

**Icons/Fonts:** Use `@expo/vector-icons` (Ionicons) — it's cross-platform. Load custom fonts via `expo-font`; never reference system fonts that may not exist on Android.

## Critical Constraints

- The app is **offline-first**: all data lives in AsyncStorage; no network dependency for core functionality. Any future cloud sync must layer on top, never replace, local persistence.
- `react-native-reanimated/plugin` must remain the **last** plugin in `babel.config.js`.
- `react` and `react-dom` must stay pinned to the **same exact version** (`19.2.6`); mismatches cause silent failures on Web.
