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
      <Stack.Screen 
        name="drawer/drawerscreen" 
        options={{ 
          headerShown: false,
          title: 'Menu',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="drawer/my_profile" 
        options={{ 
          headerShown: false,
          title: 'Profile Details'
        }} 
      />
      <Stack.Screen 
        name="drawer/app_language" 
        options={{ 
          headerShown: false,
          title: 'App Language'
        }} 
      />
      {/* Add other booth agent specific screens here */}
    </Stack>
  );
}