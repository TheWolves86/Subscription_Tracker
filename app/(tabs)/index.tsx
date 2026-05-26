import dayjs from "dayjs";
import { useUser } from "@clerk/expo";
import { Text, View, Image, FlatList } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import image from "@/constants/image";
import { HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS, HOME_SUBSCRIPTIONS} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import ListHeading  from "@/Components/listheading";
import UpcomingSubscriptionCard from "@/Components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/Components/SubscriptionCard";
import { useState } from "react";

//This is the main page

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  const { user } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)
  const displayName =
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    HOME_USER.name;
  const avatarSource = user?.imageUrl ? { uri: user.imageUrl } : image.avatar;

  return (
    <SafeAreaView className="flex-1 bg-background p-3">
      <FlatList
        data={HOME_SUBSCRIPTIONS}
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
              <Image source={icons.add} className="home-add-icon" />
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("DD/MM")}</Text>
              </View>
            </View>

            <View>
              <ListHeading title="Upcoming Subscriptions" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming subscription</Text>}
              />
            </View>

            <ListHeading title="All Subscriptions" />
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
    </SafeAreaView>
  );
}
