import { Stack } from 'expo-router';

export default function AssemblyInchargeLayout() {
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
      {/* Add other assembly incharge specific screens here */}
    </Stack>
  );
}