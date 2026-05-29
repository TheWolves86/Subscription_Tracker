import CreateSubscriptionModal from "@/Components/CreateSubscriptionModal"; // Import the new modal
import ListHeading from "@/Components/listheading";
import SubscriptionCard from "@/Components/SubscriptionCard";
import { useSubscriptions } from "@/Components/SubscriptionContext";
import UpcomingSubscriptionCard from "@/Components/UpcomingSubscriptionCard";
import { HOME_USER } from "@/constants/data";
import { icons } from "@/constants/icons";
import image from "@/constants/image";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native"; // Add Pressable
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

//This is the main page

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  const { user } = useUser();
  const { subscriptions, addSubscription } = useSubscriptions();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
  const displayName =
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    HOME_USER.name;
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : image.avatar;

  const handleAddSubscription = (newSub: any) => {
    addSubscription(newSub);
    setIsModalVisible(false); // Close modal after adding
  };

  const totalMonthlySpend = useMemo(() => {
    return (subscriptions || []).reduce((acc, sub) => {
      const price = sub.price || 0;
      return acc + (sub.frequency === "Yearly" ? price / 12 : price);
    }, 0);
  }, [subscriptions]);

  // Task 3: Filter upcoming subscriptions (due in 5 days or less)
  const upcoming = useMemo(() => {
    if (!subscriptions) return [];
    return subscriptions.filter((sub: any) => {
      if (!sub?.renewalDate) return false;
      const daysLeft = dayjs(sub.renewalDate).diff(dayjs(), "day");
      return daysLeft >= 0 && daysLeft <= 5;
    });
  }, [subscriptions]);

  return (
    <SafeAreaView className="flex-1 bg-background p-3">
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={<Text className='home-empty-state'>No Subscription Yet!</Text>}
        ListHeaderComponent={
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={avatarSource} className="home-avatar" />
                <Text className="home-user-name">{displayName}</Text>
              </View>
              <Pressable onPress={() => setIsModalVisible(true)}>
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Monthly Spend</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">{formatCurrency(totalMonthlySpend)}</Text>
                <Text className="home-balance-date">{dayjs().format("MMM")}</Text>
              </View>
            </View>

            <View>
              <ListHeading title="Upcoming Subscriptions" />
              <FlatList
                data={upcoming}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard 
                    {...item} 
                    daysLeft={dayjs(item.renewalDate).diff(dayjs(), 'day')} 
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming subscription</Text>}
              />
            </View>

            <ListHeading title="All Subscriptions" onActionPress={() => router.push("/subscriptions")} />
          </>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)}
          />
        )}
      />
      <CreateSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddSubscription}
      />
    </SafeAreaView>
  );
}
