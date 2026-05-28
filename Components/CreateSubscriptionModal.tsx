import { icons } from "@/constants/icons"
import { clsx } from "clsx"
import dayjs from 'dayjs'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

interface CreateSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (subscription: any) => void;
}

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Design: "#f5c542",
  "Developer Tools": "#e8def8",
  "AI Tools": "#b8d4e3",
  Cloud: "#b8e8d0",
  Productivity: "#ea7a53",
  Music: "#8fd1bd",
  Entertainment: "#8fd1bd",
  Other: "#f6eecf",
};

export default function CreateSubscriptionModal({ visible, onClose, onAdd }: CreateSubscriptionModalProps) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
    const [category, setCategory] = useState("Entertainment");
    const [nextBillingDate, setNextBillingDate] = useState(dayjs().add(1, 'month').format('YYYY-MM-DD'));

    const isValid = 
        name.trim().length > 0 && 
        !isNaN(parseFloat(price)) && 
        parseFloat(price) > 0 && 
        dayjs(nextBillingDate).isValid();

    const handleSubmit = () => {
        if (!isValid){
            return null
        }
        const newSubscription = {
            id: Math.random().toString(36).substring(7),
            name: name.trim(),
            currency: "USD", // Added currency as per existing subscriptions
            price: parseFloat(price),
            frequency,
            category,
            status: "active",
            startDate : dayjs().toISOString(),
            renewalDate: dayjs(nextBillingDate).toISOString(),
            icon: icons.wallet,
            billing: frequency,
            color: CATEGORY_COLORS[category] || "#8fd1bd",
        };

    onAdd(newSubscription);
    handleReset();
  };

  const handleReset = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    setNextBillingDate(dayjs().add(1, 'month').format('YYYY-MM-DD'));
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="modal-overlay">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="modal-container"
        >
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <TouchableOpacity onPress={onClose} className="modal-close">
              <Text className="modal-close-text">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="modal-body" showsVerticalScrollIndicator={false}>
            <View className="auth-field">
              <Text className="auth-label">Subscription Name</Text>
              <TextInput
                className="auth-input"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Netflix"
                placeholderTextColor="rgba(0,0,0,0.3)"
              />
            </View>

            <View className="auth-field mt-4">
              <Text className="auth-label">Monthly Price (USD)</Text>
              <TextInput
                className="auth-input"
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="rgba(0,0,0,0.3)"
              />
            </View>

            <View className="auth-field mt-4">
              <Text className="auth-label">Next Billing Date (YYYY-MM-DD)</Text>
              <TextInput
                className="auth-input"
                value={nextBillingDate}
                onChangeText={setNextBillingDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(0,0,0,0.3)"
                keyboardType="default"
              />
            </View>

            <View className="auth-field mt-4">
              <Text className="auth-label">Billing Frequency</Text>
              <View className="picker-row">
                {(["Monthly", "Yearly"] as const).map((freq) => (
                  <Pressable
                    key={freq}
                    onPress={() => setFrequency(freq)}
                    className={clsx("picker-option", frequency === freq && "picker-option-active")}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === freq && "picker-option-text-active"
                      )}
                    >
                      {freq}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="auth-field mt-4">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={clsx("category-chip", category === cat && "category-chip-active")}
                  >
                    <Text
                      className={clsx(
                        "category-chip-text",
                        category === cat && "category-chip-text-active"
                      )}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid}
              className={clsx("auth-button mb-10 mt-6", !isValid && "auth-button-disabled")}
            >
              <Text className="auth-button-text">Create Subscription</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
