import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../src/hooks/useHabits';
import { toDateKey, getLastNDays, calculateStreak } from '../src/utils/helpers';
import HabitCard from '../src/components/HabitCard';
import AddHabitModal from '../src/components/AddHabitModal';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning ☀️';
  if (h < 17) return 'Good afternoon 🌤';
  return 'Good evening 🌙';
}

export default function TodayScreen() {
  const { habits, logs, addHabit, toggleLog, isCompletedOn } = useHabits();
  const [showModal, setShowModal] = useState(false);

  const today = useMemo(() => toDateKey(new Date()), []);
  const weekDays = useMemo(() => getLastNDays(7), []);
  const now = new Date();
  const dateStr = `${DAYS_SHORT[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  const activeHabits = habits.filter((h) => !h.archivedAt);
  const completedToday = activeHabits.filter((h) => isCompletedOn(h.id, today)).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        {activeHabits.length > 0 && (
          <View style={[styles.badge, completedToday === activeHabits.length && styles.badgeDone]}>
            <Text style={styles.badgeText}>{completedToday}/{activeHabits.length}</Text>
          </View>
        )}
      </View>

      {/* Week Strip */}
      <View style={styles.weekStrip}>
        {weekDays.map((day) => {
          const d = new Date(day + 'T12:00:00');
          const isToday = day === today;
          const hasCompleted = activeHabits.some((h) => isCompletedOn(h.id, day));
          return (
            <View key={day} style={[styles.dayPill, isToday && styles.dayPillActive]}>
              <Text style={[styles.dayLetter, isToday && styles.dayTextActive]}>
                {DAYS_SHORT[d.getDay()][0]}
              </Text>
              <Text style={[styles.dayNum, isToday && styles.dayTextActive]}>
                {d.getDate()}
              </Text>
              <View style={[styles.dot, hasCompleted && (isToday ? styles.dotToday : styles.dotFilled)]} />
            </View>
          );
        })}
      </View>

      {/* Habit List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {activeHabits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySub}>Tap + to add your first habit.</Text>
          </View>
        ) : (
          activeHabits.map((habit) => {
            const completedDates = logs
              .filter((l) => l.habitId === habit.id)
              .map((l) => l.completedAt.split('T')[0]);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                isCompleted={isCompletedOn(habit.id, today)}
                streak={calculateStreak(completedDates)}
                onToggle={() => toggleLog(habit.id, today)}
              />
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>

      <AddHabitModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={addHabit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20,
  },
  greeting: { fontSize: 14, color: '#8888AA', fontWeight: '500', marginBottom: 2 },
  date: { fontSize: 26, color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.5 },
  badge: {
    backgroundColor: '#6C5CE7', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
  },
  badgeDone: { backgroundColor: '#00CEC9' },
  badgeText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  weekStrip: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 24, marginBottom: 24,
  },
  dayPill: {
    alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 12,
    paddingVertical: 8, width: 40,
  },
  dayPillActive: { backgroundColor: '#6C5CE7' },
  dayLetter: { fontSize: 10, color: '#555570', fontWeight: '700', textTransform: 'uppercase' },
  dayNum: { fontSize: 15, color: '#AAAACC', fontWeight: '700', marginVertical: 2 },
  dayTextActive: { color: '#FFFFFF' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  dotFilled: { backgroundColor: '#00CEC9' },
  dotToday: { backgroundColor: 'rgba(255,255,255,0.8)' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 20, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#8888AA' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#6C5CE7', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 10,
  },
});
