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
        name="age80above" 
        options={{ 
          title: 'Age 80+ Voters',
          headerBackTitle: 'Back'
        }} 
      />
      {/* Add other booth agent specific screens here */}
    </Stack>
  );
}