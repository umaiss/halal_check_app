import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, StatusBar, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { Input, Button, LargeText, SmallText } from '../../components';
import Theme from '../../theme/theme';
import styles from './styles';
import { setCredentials } from '../../redux/slices/auth/authSlice';
import { useLoginMutation, useGoogleLoginMutation, useAppleLoginMutation } from '../../redux/authApi/authApi';
import ASYNC_KEYS from '../../utils/async-keys';
import { signInWithGoogle, signInWithApple } from '../../utils';

function Login() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();
    const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
    const [appleLogin, { isLoading: isAppleLoading }] = useAppleLoginMutation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const validate = () => {
        let valid = true;

        // Email Validation
        if (!email) {
            setEmailError('Email is required');
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email');
            valid = false;
        } else {
            setEmailError('');
        }

        // Password Validation
        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else {
            setPasswordError('');
        }

        return valid;
    };

    const handleAuthSuccess = async (response: any) => {
        if (response?.access_token && response?.user) {
            await AsyncStorage.setItem(ASYNC_KEYS.USER_TOKEN, response.access_token);
            if (response.refresh_token) {
                await AsyncStorage.setItem(ASYNC_KEYS.USER_REFRESH_TOKEN, response.refresh_token);
            }
            await AsyncStorage.setItem("UserInfo", JSON.stringify(response.user));

            dispatch(setCredentials({
                token: response.access_token,
                refreshToken: response.refresh_token || null,
                user: response.user
            }));
        } else {
            Alert.alert('Login Failed', 'Invalid response from server');
        }
    };

    const handleLogin = async () => {
        if (validate()) {
            try {
                console.log('Login Request:', { email, password });
                const response = await login({ email, password }).unwrap();
                console.log('Login Success:', response);
                await handleAuthSuccess(response);
            } catch (err: any) {
                console.error("Login Error", err);
                const errorMessage = err?.data?.message || err?.data?.error || 'Something went wrong. Please try again.';
                Alert.alert('Login Failed', errorMessage);
            }
        }
    };

    const handleSocialLogin = async (platform: string) => {
        try {
            if (platform === 'Google') {
                const { idToken } = await signInWithGoogle();
                console.log('Google Sign-In Success: Got ID Token');
                const response = await googleLogin({ idToken }).unwrap();
                await handleAuthSuccess(response);
            } else if (platform === 'Apple') {
                const { identityToken, name, email } = await signInWithApple();
                console.log('Apple Sign-In Success: Got Identity Token');
                const response = await appleLogin({ identityToken, name, email }).unwrap();
                await handleAuthSuccess(response);
            }
        } catch (err: any) {
            console.error(`${platform} Login Error:`, err);
            // Ignore if user cancelled
            const isCancelled = 
                err?.message?.includes('Sign in action cancelled') || 
                err?.code === 'SIGN_IN_CANCELLED' || 
                err?.code === '1' ||
                err?.message?.includes('user canceled');
            if (isCancelled) {
                return;
            }
            const errorMessage = err?.data?.message || err?.data?.error || err?.message || 'Authentication failed. Please try again.';
            Alert.alert(`${platform} Sign-In Failed`, errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#074330" />
            
            {/* Background glowing blobs */}
            <View style={styles.glowBlob1} />
            <View style={styles.glowBlob2} />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <LargeText textStyles={styles.title}>Welcome Back!</LargeText>
                        <SmallText textStyles={styles.subTitle} color="rgba(255, 255, 255, 0.65)">
                            Login to continue your Halal journey
                        </SmallText>
                    </View>

                    {/* Glassmorphic Form Card */}
                    <View style={styles.glassCard}>
                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={(text: string) => { setEmail(text); if (emailError) setEmailError(''); }}
                                error={emailError}
                                keyboardType="email-address"
                                mandatory
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={(text: string) => { setPassword(text); if (passwordError) setPasswordError(''); }}
                                error={passwordError}
                                secureTextEntry={secureTextEntry}
                                mandatory
                                renderRightIcon={
                                    <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                                        <Ionicons style={styles.icon} name={secureTextEntry ? "eye-off" : "eye"} size={20} color="rgba(255, 255, 255, 0.6)" />
                                    </TouchableOpacity>
                                }
                            />
                        </View>

                        <View style={styles.forgotPasswordContainer}>
                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <SmallText textStyles={styles.forgotPasswordText}>Forgot Password?</SmallText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button 
                                onPress={handleLogin} 
                                isLoading={isLoading}
                                buttonTextColor={Theme.color.COLOR_PRIMARY_GREEN}
                                containerStyle={styles.buttonStyle}
                                ActivityIndicatorColor={Theme.color.COLOR_PRIMARY_GREEN}
                            >
                                LOGIN
                            </Button>
                        </View>

                        <View style={styles.socialLoginContainer}>
                            <SmallText textStyles={styles.socialDividerText} size={3.2}>Or connect with</SmallText>
                            <View style={styles.socialButtonsRow}>
                                <TouchableOpacity 
                                    style={styles.socialButton} 
                                    onPress={() => handleSocialLogin('Google')}
                                    disabled={isLoading || isGoogleLoading || isAppleLoading}
                                >
                                    {isGoogleLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Ionicons name="logo-google" size={22} color="#FFFFFF" />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.socialButton} 
                                    onPress={() => handleSocialLogin('Apple')}
                                    disabled={isLoading || isGoogleLoading || isAppleLoading}
                                >
                                    {isAppleLoading ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Footer Links */}
                    <View style={styles.signupContainer}>
                        <SmallText textStyles={styles.signupText}>Don&apos;t have an account? </SmallText>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <SmallText textStyles={styles.signupLink}>
                                Sign Up
                            </SmallText>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

export default Login;

