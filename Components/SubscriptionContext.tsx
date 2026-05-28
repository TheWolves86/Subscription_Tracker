import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SubscriptionContextType {
  subscriptions: any[];
  addSubscription: (sub: any) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // Load data from device on mount
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const saved = await AsyncStorage.getItem('subscriptions');
        if (saved) {
          setSubscriptions(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load subscriptions", error);
      }
    };
    loadSubscriptions();
  }, []);

  const addSubscription = async (newSub: any) => {
    const updated = [newSub, ...subscriptions];
    setSubscriptions(updated);
    try {
      await AsyncStorage.setItem('subscriptions', JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save subscription", error);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptions must be used within a SubscriptionProvider");
  }
  return context;
};