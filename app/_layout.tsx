import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1A1A2E',
            borderTopColor: 'rgba(255,255,255,0.06)',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 88 : 70,
            paddingBottom: Platform.OS === 'ios' ? 28 : 14,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#6C5CE7',
          tabBarInactiveTintColor: '#555570',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <Ionicons name="today" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: 'All Habits',
            tabBarIcon: ({ color }) => <Ionicons name="grid" size={22} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
