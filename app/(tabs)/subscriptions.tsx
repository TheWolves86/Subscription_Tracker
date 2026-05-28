import SubscriptionCard from "@/Components/SubscriptionCard";
import { useSubscriptions } from "@/Components/SubscriptionContext";
import { styled } from "nativewind";
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  // Filter subscriptions based on search query (name or category)
  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return subscriptions.filter((sub) =>
      sub.name.toLowerCase().includes(query) ||
      (sub.category && sub.category.toLowerCase().includes(query))
    );
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-3">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View className="h-3" />}
          ListEmptyComponent={<Text className='home-empty-state text-center mt-10'>No subscriptions found</Text>}
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="text-2xl font-bold text-foreground mb-4">My Subscriptions</Text>
              <View className="bg-card rounded-2xl px-4 py-3 border border-border/50">
                <TextInput
                  placeholder="Search by name or category..."
                  placeholderTextColor="rgba(0, 0, 0, 0.45)"
                  className="text-foreground text-base"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
                />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => setExpandedSubscriptionId((prev) => prev === item.id ? null : item.id)}
            />
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
export default Subscriptions
