import { Link } from "expo-router";
import dayjs from "dayjs";
import "@/global.css"
import { Text, View, Image, FlatList, ScrollView } from "react-native";
import { styled } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import image from "@/constants/image";
import { HOME_BALANCE, HOME_USER, UPCOMING_SUBSCRIPTIONS, HOME_SUBSCRIPTIONS} from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import ListHeading  from "@/Components/listheading";
import UpcomingSubscriptionCard from "@/Components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/Components/SubscriptionCard";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-3">
        <View className="home-header">
          <View className="home-user">
            <Image source={image.avatar} className="home-avatar"></Image>
            <Text className="home-user-name">{HOME_USER.name}</Text>
          </View>
          <Image source={icons.add} className="home-add-icon"/>
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
          <FlatList data={UPCOMING_SUBSCRIPTIONS}
          renderItem={({ item }) => <UpcomingSubscriptionCard {...item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={<Text className="home-empty-state">No upcoming subscription</Text>}
          />
        </View>
        <View>
          <ListHeading title="All Subscriptions" />
          <SubscriptionCard {...HOME_SUBSCRIPTIONS[0]} />
        </View>
    </SafeAreaView>
  );
}