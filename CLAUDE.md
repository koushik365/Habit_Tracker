# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm start            # Expo dev server — scan QR with Expo Go on a physical device
npm run ios          # Launch iOS simulator (requires prebuild)
npm run android      # Launch Android emulator (requires prebuild)
npm run web          # Open in web browser (Metro bundler)
npx expo start --clear  # Full cache purge — use after renaming files or dependency changes
```

There is no test runner configured.

## Architecture

### Routing
Expo Router file-based routing. The `app/` directory is **exclusively** for screens and layout — no business logic belongs here. The entry point is `app/_layout.tsx`.

Three tabs defined in `app/_layout.tsx`:
- `app/index.tsx` — Home screen: week-strip navigation, habit list for the selected date, all overlays (settings, calendar, alarms)
- `app/stats.tsx` — Progress screen: streaks, heatmap, level badge, category breakdown
- `app/challenges.tsx` — Challenges screen: create/view time-boxed streak challenges per habit

The layout also handles the **onboarding gate**: if `habit_tracker:onboarded` is not set in storage, a full-screen `<Onboarding>` component renders instead of the tab navigator.

### State & Persistence
No external state manager. Each screen independently calls `useHabits()` — all three tabs mount separate instances that load from storage in parallel. This is intentional: tabs are not expected to share live state across simultaneous mounts.

`useHabits` is the single source of truth for habits and logs. `useChallenges(habits, logs)` receives habits/logs as props and manages challenge state separately. `useStreakRewards(habits, logs)` watches for milestone breaches and surfaces one reward modal at a time.

`src/store/storage.ts` is the only persistence layer. All keys:
- `habit_tracker:habits` — `Habit[]`
- `habit_tracker:logs` — `HabitLog[]`
- `habit_tracker:challenges` — `Challenge[]`
- `habit_tracker:milestones` — `StreakMilestone[]`
- `habit_tracker:onboarded` — `'true'` flag
- `habit_tracker:notifications_enabled` — `'true'` / `'false'`
- `habit_tracker:morning_checkin_time` — e.g. `'08:00'`
- `habit_tracker:evening_checkin_time` — e.g. `'20:00'`

The following keys are written directly via `AsyncStorage` from `app/index.tsx` (not wrapped in `storage.ts`):
- `habit_tracker:early_alarm_enabled` — `'true'` / `'false'`
- `habit_tracker:early_alarm_time` — e.g. `'06:00'`
- `habit_tracker:vacation_mode` — `'off'` | `'on'` | `'scheduled'`
- `habit_tracker:vacation_start` / `habit_tracker:vacation_end` — `YYYY-MM-DD`
- `habit_tracker:calendar_provider` — `'none'` | `'google'` | `'apple'` | `'outlook'`
- `habit_tracker:user_cal_events` — JSON `{date, name, time?}[]`

**Migration:** `getHabits()` and `getLogs()` in `storage.ts` silently backfill missing fields on read (`category → 'simple'`, `habitType → 'binary'`, `targetCount → 1`, `count → 1`). Any new fields added to the types must have a corresponding migration here.

### Data Model (`src/types/index.ts`)

**`Habit`** — static definition. Key fields:
- `frequency`: `'daily' | 'weekly' | 'monthly' | 'custom'`
- `habitType`: `'binary' | 'count'` (kept for backwards compat; UI uses `category` instead)
- `targetCount`: the completion threshold (e.g. `2000` for 2000ml water, `15` for 15min meditation, `1` for simple)
- `targetDays?: number[]` — 0–6 (weekly); `targetMonthDays?: number[]` — 1–31 (monthly); `customInterval?: number` + `customIncludeDays?: number[]` (custom)
- `category: HabitCategory` — drives which `LogProgressModal` UI is shown and notification copy
- `reminderEnabled?` / `reminderTime?` — habit-level notification at a specific time

**`HabitLog`** — one record per day per habit:
- `count` — current progress toward `targetCount`; completion is `log.count >= habit.targetCount`
- `isSkipped?: boolean` — skipped days do NOT count toward streaks (only vacation mode does)
- `feeling?`, `exerciseSets?`, `note?` — rich logging fields for specific categories

**`Challenge`** — time-boxed streak commitment for a single habit. Status is derived on-the-fly by `useChallenges` (not stored); `completedAt`/`failedAt` are written back to storage once finalized.

**`StreakMilestone`** — records when a habit crossed a streak threshold (3, 7, 14, 21, 30, 60, 100 days). Prevents the same reward from showing twice.

### Scheduling Logic
The home screen filters habits for the selected date using `isCustomScheduled()` from `src/utils/helpers.ts`. Streak calculations use `calculateStreak(completedDates, skippedDates)` where `skippedDates` are **vacation dates only** — manual skips (`log.isSkipped`) do not preserve streaks.

Date handling always uses `YYYY-MM-DD` string keys. `addDays()` pins to noon UTC (`T12:00:00Z`) to avoid DST boundary issues.

### Design System
All tokens: `src/constants/theme.ts` — `Colors`, `Spacing`, `BorderRadius`, `FontSize`. Components currently hard-code hex values inline; prefer migrating to tokens when touching a component.

Color palette:
- Background: `#0F0F1A`, Surface: `#1A1A2E`, Elevated surface: `#22223B`
- Primary accent: `#6C5CE7` (purple), Secondary: `#00CEC9` (teal)

**Glassmorphism:** emulated with `rgba(255,255,255,0.05)` backgrounds and `rgba(255,255,255,0.06–0.08)` borders — not actual blur.

**Animations:** React Native Reanimated (`useSharedValue`, `withSpring`) is the target. `HabitCard` still uses the legacy `Animated` API — new animated components must use Reanimated. Degrade gracefully on low-end Android and older web.

### TypeScript Path Aliases
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

**Icons/Fonts:** Use `@expo/vector-icons` (Ionicons). Load custom fonts via `expo-font`; never reference system fonts that may not exist on Android.

**Notifications:** `useNotifications` no-ops on Web (`Platform.OS === 'web'`) — all `expo-notifications` calls are guarded.

## Critical Constraints

- **Offline-first:** all data lives in AsyncStorage; no network dependency for core functionality.
- `react-native-reanimated/plugin` must remain the **last** plugin in `babel.config.js`.
- `react` and `react-dom` must stay pinned to the **same exact version** (`19.2.6`); mismatches cause silent failures on Web.
- Never delete or rename storage keys without adding a migration in `getHabits()` / `getLogs()` in `storage.ts`.
