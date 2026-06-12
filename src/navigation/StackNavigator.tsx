import React, { useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import { RootStackParamList } from './types/RootParamList';
import BottomTabNavigator from './BottomTabNavigator';
import { IngredientsResult, Onboarding, Scan, Login, Signup, Upload, ForgotPassword, ResetPassword, Search, PreviewScan } from '../screens';

import { RootState } from '../redux/store';
import { useRegisterFcmTokenMutation } from '../redux/authApi/authApi';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Props passed from App.tsx
interface StackNavigatorProps {
    isOnboardingCompleted: boolean;
}

function StackNavigator({ isOnboardingCompleted }: StackNavigatorProps) {
    const { token } = useSelector((state: RootState) => state.auth);
    const isAuthenticated = !!token;
    const [registerFcmToken] = useRegisterFcmTokenMutation();

    const requestUserPermission = async () => {
        try {
            // Request Android 13+ POST_NOTIFICATIONS permission explicitly
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('⚠️ Android notification permission denied');
                    return null;
                }
            }

            // Register the device with APNs for remote messages (no-op on Android)
            await messaging().registerDeviceForRemoteMessages();

            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                const fcmToken = await messaging().getToken();
                return fcmToken;
            }
        } catch (error) {
            console.error('Error requesting FCM permissions:', error);
        }
        return null;
    };

    useEffect(() => {
        if (isAuthenticated) {
            requestUserPermission()
                .then((fcmToken) => {
                    if (fcmToken) {
                        registerFcmToken({ fcm_token: fcmToken })
                            .unwrap()
                            .then(() => console.log('✅ FCM token registered with backend successfully'))
                            .catch((err) => console.error('❌ Failed to register FCM token:', err));
                    } else {
                        console.log('⚠️ No FCM token retrieved (permissions might be denied)');
                    }
                })
                .catch((err) => console.error('❌ Error during FCM bootstrap:', err));
        }
    }, [isAuthenticated, registerFcmToken]);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('🔔 Foreground FCM Message:', remoteMessage);
            if (remoteMessage.notification) {
                Alert.alert(
                    remoteMessage.notification.title || 'Notification',
                    remoteMessage.notification.body || ''
                );
            }
        });
        return unsubscribe;
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                {isAuthenticated ? (
                    // App Stack
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={BottomTabNavigator}
                        />
                        <Stack.Screen
                            name="IngredientsResult"
                            component={IngredientsResult}
                            options={{
                                title: 'Ingredients',
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="Scan"
                            component={Scan}
                            options={{
                                title: 'Scan',
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="Upload"
                            component={Upload}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Search"
                            component={Search}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="PreviewScan"
                            component={PreviewScan}
                            options={{ headerShown: false }}
                        />
                    </>
                ) : (
                    // Auth Stack
                    <>
                        {!isOnboardingCompleted && (
                            <Stack.Screen
                                name="Onboarding"
                                component={Onboarding}
                                options={{ headerShown: false }}
                            />
                        )}
                        <Stack.Screen
                            name="Login"
                            component={Login}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Signup"
                            component={Signup}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPassword}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ResetPassword"
                            component={ResetPassword}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default StackNavigator;