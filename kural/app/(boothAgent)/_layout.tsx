import { Stack } from 'expo-router';

export default function BoothAgentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          headerShown: false,
          title: 'Dashboard' 
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
          title: 'Profile' 
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          headerShown: false,
          title: 'Notifications' 
        }} 
      />
      {/* Add other booth agent specific screens here */}
    </Stack>
  );
}