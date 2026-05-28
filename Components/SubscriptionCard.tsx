import { formatCurrency, formatSubscriptionDateTime } from '@/lib/utils';
import { clsx } from 'clsx';
import React from 'react';
import { Image, Pressable, Text, View, } from 'react-native';

interface SubscriptionCardProps {
    name: string;
    price: number;
    currency?: string;
    icon: any;
    billing: string;
    color?: string;
    category?: string;
    plan?: string;
    renewalDate?: string;
    onPress: () => void;
    expanded: boolean;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
}

const SubscriptionCard = ({name, price, currency, icon, billing, color, category, plan, renewalDate, onPress, expanded, paymentMethod, status, startDate}: SubscriptionCardProps) => {
    
    return (
    <Pressable onPress={onPress} className={clsx('sub-card', expanded? 'sub-card-expanded':'bg-card')} style={!expanded && color ? {backgroundColor:color}: undefined} >
        <View className='sub-head'>
            <View className="sub-main">
                <Image source={icon} className="sub-icon"/>
                <View className="sub-copy">
                    <Text className="sub-title" numberOfLines={1}>{name}</Text>
                    <Text numberOfLines={1} ellipsizeMode='tail' className='sub-meta'>{category?.trim() || plan?.trim() || (renewalDate? formatSubscriptionDateTime(renewalDate): '')}</Text>
                </View>
            </View>
            <View className='sub-price-box'>
                <Text className='sub-price'>{formatCurrency(price)}</Text>
                <Text className='sub-billing'>{billing}</Text>
            </View>
        </View>
        {expanded && (
            <View className='sub-body'>
                <View className='sub-details'>
                    <View className='sub-row'>
                        <View className='sub-row-copy'>
                            <Text className='sub-label'>Category: </Text>
                            <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{category?.trim()}</Text>
                        </View>
                    </View>
                    <View className='sub-row'>
                        <View className='sub-row-copy'>
                            <Text className='sub-label'>Payment: </Text>
                            <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{paymentMethod?.trim()}</Text>
                        </View>
                    </View>
                    <View className='sub-row'>
                        <View className='sub-row-copy'>
                            <Text className='sub-label'>Started: </Text>
                            <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{startDate ? formatSubscriptionDateTime(startDate): ''}</Text>
                        </View>
                    </View>
                    <View className='sub-row'>
                        <View className='sub-row-copy'>
                            <Text className='sub-label'>Status: </Text>
                            <Text className='sub-value' numberOfLines={1} ellipsizeMode='tail'>{status?.trim()}</Text>
                        </View>
                    </View>
                </View>
            </View>
        )
        }
    </Pressable>


  )
}

export default SubscriptionCard
