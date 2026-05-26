import { useClerk, useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

import image from "@/constants/image";

const SafeAreaView = styled(RNSafeAreaView);
const signInHref = "/(auth)/sign-in" as Href;

export default function Settings() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress ?? "Signed in";
  const name = user?.fullName || user?.firstName || email.split("@")[0];
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : image.avatar;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    router.replace(signInHref);
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-3">
      <View className="gap-5 pt-3">
        <View>
          <Text className="text-3xl font-sans-extrabold text-primary">Settings</Text>
          <Text className="mt-1 text-base font-sans-medium text-muted-foreground">
            Manage your account and app preferences.
          </Text>
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-4">
            <Image source={avatarSource} className="size-16 rounded-full" />
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-sans-bold text-primary" numberOfLines={1}>
                {name}
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground" numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          className="items-center rounded-2xl bg-primary py-4"
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#fff9e3" />
          ) : (
            <Text className="font-sans-bold text-background">Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
