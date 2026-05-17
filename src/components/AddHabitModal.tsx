import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { Habit } from '../types';

const COLORS = [
  '#6C5CE7', '#00CEC9', '#FD79A8', '#FDCB6E',
  '#55EFC4', '#74B9FF', '#E17055', '#A29BFE',
];

const ICONS = ['🏃', '📚', '💧', '🧘', '💪', '🍎', '😴', '✍️', '🎯', '🌿', '🎸', '💻'];

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
}

export default function AddHabitModal({ visible, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), color: selectedColor, icon: selectedIcon, frequency: 'daily' });
    setName('');
    setSelectedColor(COLORS[0]);
    setSelectedIcon(ICONS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheet}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>New Habit</Text>

        <TextInput
          style={styles.input}
          placeholder="Habit name..."
          placeholderTextColor="#555570"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotSelected]}
              onPress={() => setSelectedColor(c)}
            />
          ))}
        </View>

        <Text style={styles.label}>Icon</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconRow}>
          {ICONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              style={[styles.iconBtn, selectedIcon === ic && { backgroundColor: selectedColor + '33', borderColor: selectedColor }]}
              onPress={() => setSelectedIcon(ic)}
            >
              <Text style={styles.iconText}>{ic}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: selectedColor }, !name.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>Add Habit</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handle: {
    width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  title: { fontSize: 22, color: '#FFFFFF', fontWeight: '700', marginBottom: 20 },
  input: {
    backgroundColor: '#22223B', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#FFFFFF', marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  label: { fontSize: 12, color: '#8888AA', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: '#FFFFFF' },
  iconRow: { marginBottom: 24 },
  iconBtn: {
    width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginRight: 8, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'transparent',
  },
  iconText: { fontSize: 22 },
  addBtn: { borderRadius: 14, padding: 16, alignItems: 'center' },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
