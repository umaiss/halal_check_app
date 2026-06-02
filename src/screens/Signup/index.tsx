import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
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
import { useRegisterMutation } from '../../redux/authApi/authApi';
import ASYNC_KEYS from '../../utils/async-keys';


function Signup() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useDispatch();
    const [register, { isLoading }] = useRegisterMutation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Error States
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

    const validate = () => {
        let valid = true;

        // Name
        if (!name.trim()) {
            setNameError('Name is required');
            valid = false;
        } else {
            setNameError('');
        }

        // Email
        if (!email) {
            setEmailError('Email is required');
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email');
            valid = false;
        } else {
            setEmailError('');
        }

        // Password
        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        } else {
            setPasswordError('');
        }

        // Confirm Password
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            valid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            valid = false;
        } else {
            setConfirmPasswordError('');
        }

        return valid;
    };

    const handleSignup = async () => {
        if (validate()) {
            try {
                const response = await register({ name, email, password }).unwrap();
                console.log('Signup Success:', response);

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
                    Alert.alert('Signup Failed', 'Invalid response from server');
                }
            } catch (err: any) {
                console.error("Signup Error", err);
                const errorMessage = err?.data?.message || err?.data?.error || 'Something went wrong. Please try again.';
                Alert.alert('Signup Failed', errorMessage);
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#074330" />
            
            {/* Background glowing blobs */}
            <View style={styles.glowBlob1} />
            <View style={styles.glowBlob2} />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <LargeText textStyles={styles.title}>Create Account</LargeText>
                        <SmallText textStyles={styles.subTitle} color="rgba(255, 255, 255, 0.65)">
                            Join us to start scanning products!
                        </SmallText>
                    </View>

                    {/* Glassmorphic Form Card */}
                    <View style={styles.glassCard}>
                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="Full Name"
                                placeholder="John Doe"
                                value={name}
                                onChangeText={(text: string) => { setName(text); if (nameError) setNameError(''); }}
                                error={nameError}
                                mandatory
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="Email"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={(text: string) => { setEmail(text.toLowerCase()); if (emailError) setEmailError(''); }}
                                error={emailError}
                                keyboardType="email-address"
                                mandatory
                                inputProps={{ autoCapitalize: 'none' }}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="Password"
                                placeholder="Create a password"
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

                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChangeText={(text: string) => { setConfirmPassword(text); if (confirmPasswordError) setConfirmPasswordError(''); }}
                                error={confirmPasswordError}
                                secureTextEntry={secureConfirmEntry}
                                mandatory
                                renderRightIcon={
                                    <TouchableOpacity onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}>
                                        <Ionicons style={styles.icon} name={secureConfirmEntry ? "eye-off" : "eye"} size={20} color="rgba(255, 255, 255, 0.6)" />
                                    </TouchableOpacity>
                                }
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <Button 
                                onPress={handleSignup} 
                                isLoading={isLoading}
                                buttonTextColor={Theme.color.COLOR_PRIMARY_GREEN}
                                containerStyle={styles.buttonStyle}
                                ActivityIndicatorColor={Theme.color.COLOR_PRIMARY_GREEN}
                            >
                                SIGN UP
                            </Button>
                        </View>
                    </View>

                    {/* Footer Links */}
                    <View style={styles.footerContainer}>
                        <SmallText textStyles={styles.footerText}>Already have an account? </SmallText>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <SmallText textStyles={styles.footerLink}>
                                Login
                            </SmallText>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

export default Signup;

