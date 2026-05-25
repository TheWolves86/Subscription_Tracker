import { SplashScreen, Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [fontsLoaded] = useFonts({//All it does is render fonts ig
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
      'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
      'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
    })
    useEffect(() => {
      if (fontsLoaded) {
          SplashScreen.hideAsync();
      }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;
    return <Stack screenOptions={{headerShown: false}}/>
}

