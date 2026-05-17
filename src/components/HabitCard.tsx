import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Habit } from '../types';

interface Props {
  habit: Habit;
  isCompleted: boolean;
  streak: number;
  onToggle: () => void;
}

export default function HabitCard({ habit, isCompleted, streak, onToggle }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: isCompleted ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  }, [isCompleted]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  const checkScale = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.colorBar, { backgroundColor: habit.color }]} />
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.icon}>{habit.icon}</Text>
          <View>
            <Text style={[styles.name, isCompleted && styles.nameCompleted]}>
              {habit.name}
            </Text>
            <Text style={styles.streak}>
              {streak > 0 ? `🔥 ${streak} day streak` : '✨ Start today'}
            </Text>
          </View>
        </View>
        <Pressable onPress={handlePress} hitSlop={14}>
          <View
            style={[
              styles.checkOuter,
              isCompleted && { backgroundColor: habit.color, borderColor: habit.color },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: checkScale }], opacity: checkAnim }}>
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  colorBar: { width: 4 },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  icon: { fontSize: 26 },
  name: { fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginBottom: 2 },
  nameCompleted: { color: '#8888AA', textDecorationLine: 'line-through' },
  streak: { fontSize: 12, color: '#8888AA', fontWeight: '500' },
  checkOuter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
});
