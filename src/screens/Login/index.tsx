
import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { Input, Button, LargeText, SmallText } from '../../components';
import Theme from '../../theme/theme';
import styles from './styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/auth/authSlice';
import { useLoginMutation } from '../../redux/authApi/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ASYNC_KEYS from '../../utils/async-keys';

const Login = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();

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
        } else if (!/\S+@\S+\.\S/.test(email)) {
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

    const handleLogin = async () => {
        if (validate()) {
            try {
                console.log('Login Request:', { email, password });
                const response = await login({ email, password }).unwrap();
                console.log('Login Success:', response);

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
                    // Navigation handled by StackNavigator
                } else {
                    Alert.alert('Login Failed', 'Invalid response from server');
                }
            } catch (err: any) {
                console.error("Login Error", err);
                const errorMessage = err?.data?.message || err?.data?.error || 'Something went wrong. Please try again.';
                Alert.alert('Login Failed', errorMessage);
            }
        }
    };

    const handleSocialLogin = (platform: string) => {
        Alert.alert(`${platform} Login`, `Proceed with ${platform} login logic here.`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Theme.color.BACKGROUND_COLOR} />
            <View style={styles.headerContainer}>
                <LargeText textStyles={styles.title}>Welcome Back!</LargeText>
                <SmallText textStyles={styles.subTitle} color={Theme.color.COLOT_SUBTEXT}>
                    Login to continue your Halal journey
                </SmallText>
            </View>

            <View style={styles.inputContainer}>
                <Input
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
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text: string) => { setPassword(text); if (passwordError) setPasswordError(''); }}
                    error={passwordError}
                    secureTextEntry={secureTextEntry}
                    mandatory
                    renderRightIcon={
                        <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                            <Ionicons style={styles.icon} name={secureTextEntry ? "eye-off" : "eye"} size={20} color={Theme.color.COLOT_SUBTEXT} />
                        </TouchableOpacity>
                    }
                />
            </View>

            <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Reset password flow')}>
                    <SmallText color={Theme.color.COLOR_BLUE}>Forgot Password?</SmallText>
                </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
                <Button onPress={handleLogin} isLoading={isLoading}>
                    LOGIN
                </Button>
            </View>

            <View style={styles.socialLoginContainer}>
                <SmallText color={Theme.color.COLOT_SUBTEXT}>Or login with details</SmallText>
                <View style={styles.socialButtonsRow}>
                    <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Google')}>
                        <Ionicons name="logo-google" size={24} color={Theme.color.COLOR_RED} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialLogin('Apple')}>
                        <Ionicons name="logo-apple" size={24} color={Theme.color.BLACK} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.signupContainer}>
                <SmallText color={Theme.color.COLOR_TEXT}>Don't have an account? </SmallText>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <SmallText color={Theme.color.COLOR_BLUE} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                        Sign Up
                    </SmallText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Login;
