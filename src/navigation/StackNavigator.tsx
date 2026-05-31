import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootStackParamList } from './types/RootParamList';
import BottomTabNavigator from './BottomTabNavigator';
import { IngredientsResult, Onboarding, Scan, Login, Signup, Upload, ForgotPassword, ResetPassword } from '../screens';

import { RootState } from '../redux/store';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Props passed from App.tsx
interface StackNavigatorProps {
    isOnboardingCompleted: boolean;
}

function StackNavigator({ isOnboardingCompleted }: StackNavigatorProps) {
    const { token } = useSelector((state: RootState) => state.auth);
    const isAuthenticated = !!token;

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