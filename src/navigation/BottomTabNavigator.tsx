import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomTabParamList } from './types/RootParamList';
import { Home, Profile } from '../screens';
import History from '../screens/History';
import Theme from '../theme/theme';

const Tab = createBottomTabNavigator<BottomTabParamList>();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.container}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Get icon based on route name and active state
                let iconName = 'home-outline';
                let displayLabel = 'Scan';
                if (route.name === 'Home') {
                    iconName = isFocused ? 'camera' : 'camera-outline';
                    displayLabel = 'Scan';
                } else if (route.name === 'History') {
                    iconName = isFocused ? 'time' : 'time-outline';
                    displayLabel = 'History';
                } else if (route.name === 'Profile') {
                    iconName = isFocused ? 'person' : 'person-outline';
                    displayLabel = 'Profile';
                }

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={(options as any).tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={[
                            styles.tabButton,
                            isFocused ? styles.tabButtonActive : styles.tabButtonInactive
                        ]}
                        activeOpacity={0.8}
                    >
                        <Icon
                            name={iconName}
                            size={20}
                            color={isFocused ? '#FFFFFF' : Theme.color.COLOR_MUTED}
                        />
                        {isFocused && (
                            <Text style={styles.tabLabel}>
                                {displayLabel}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function BottomTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
            />
            <Tab.Screen
                name="History"
                component={History}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
        // Elevation/Shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.12,
                shadowRadius: 24,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
    },
    tabButtonActive: {
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        ...Platform.select({
            ios: {
                shadowColor: '#0E7955',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    tabButtonInactive: {
        backgroundColor: 'transparent',
    },
    tabLabel: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD,
        marginLeft: 6,
    },
});

export default BottomTabNavigator;