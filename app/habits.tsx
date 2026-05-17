import { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../src/hooks/useHabits';
import AddHabitModal from '../src/components/AddHabitModal';
import { calculateStreak } from '../src/utils/helpers';

export default function HabitsScreen() {
  const { habits, logs, addHabit, deleteHabit } = useHabits();
  const [showModal, setShowModal] = useState(false);

  const activeHabits = habits.filter((h) => !h.archivedAt);

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Habit',
      `Remove "${name}" and all its history?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>All Habits</Text>
          <Text style={styles.sub}>{activeHabits.length} habit{activeHabits.length !== 1 ? 's' : ''} tracked</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptySub}>Tap "New" to create your first habit.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const completedDates = logs
            .filter((l) => l.habitId === item.id)
            .map((l) => l.completedAt.split('T')[0]);
          const totalDone = completedDates.length;
          const streak = calculateStreak(completedDates);

          return (
            <View style={styles.row}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <View style={styles.rowInfo}>
                <Text style={styles.icon}>{item.icon}</Text>
                <View style={styles.rowText}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowMeta}>
                    {streak > 0 ? `🔥 ${streak} streak · ` : ''}
                    {totalDone} total
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => confirmDelete(item.id, item.name)} hitSlop={12}>
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </Pressable>
            </View>
          );
        }}
      />

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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24,
  },
  title: { fontSize: 28, color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.5 },
  sub: { fontSize: 13, color: '#8888AA', marginTop: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#6C5CE7', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  colorDot: { width: 4, height: '100%', borderRadius: 2, marginRight: 12, minHeight: 40 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  icon: { fontSize: 24 },
  rowText: { flex: 1 },
  rowName: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  rowMeta: { fontSize: 12, color: '#8888AA', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, color: '#FFFFFF', fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#8888AA' },
});
