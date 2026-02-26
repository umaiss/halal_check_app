import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomTabParamList } from './types/RootParamList';

// You can use react-native-vector-icons or any icon library
import { Home, Login, Profile, Scan } from '../screens';
import { height } from '../utils/dimensions';
import Theme from '../theme/theme';
import History from '../screens/History';

const Tab = createBottomTabNavigator<BottomTabParamList>();

function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'History':
                            iconName = focused ? 'scan' : 'scan-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'home';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Theme.color.COLOR_BLUE,
                tabBarInactiveTintColor: Theme.color.COLOT_SUBTEXT,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    height: height(7),
                    paddingBottom: height(0.5),
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="History"
                component={History}
                options={{ title: 'History' }}
            />
            <Tab.Screen
                name="Profile"
                component={Login}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
}

export default BottomTabNavigator;