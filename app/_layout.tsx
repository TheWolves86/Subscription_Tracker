import "@/global.css";

import { SubscriptionProvider } from "@/Components/SubscriptionContext";
import { ClerkProvider, useAuth } from "@clerk/expo";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Add your Clerk Publishable Key to the .env file or app.json extra"
  );
}

// Clerk requires a token cache for Expo. Standard implementation:
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key)
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  function SplashGate({ children }: { children: React.ReactNode }) {
    const { isLoaded } = useAuth();

    useEffect(() => {
      if (fontsLoaded && isLoaded) {
        SplashScreen.hideAsync();
      }
    }, [fontsLoaded, isLoaded]);

    if (!fontsLoaded || !isLoaded) {
      return null;
    }

    return <SubscriptionProvider>{children}</SubscriptionProvider>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <SplashGate>
          <Stack screenOptions={{ headerShown: false }} />
        </SplashGate>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
