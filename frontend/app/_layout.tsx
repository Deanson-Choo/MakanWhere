import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from "@/store/authStore";

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={isAuthenticated}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(extra_screens)" />
            </Stack.Protected>
            <Stack.Protected guard={!isAuthenticated}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
          </Stack>
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}