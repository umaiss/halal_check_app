import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { Input, Button, LargeText, SmallText } from '../../components';
import Theme from '../../theme/theme';
import styles from './styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/auth/authSlice';
import { useRegisterMutation } from '../../redux/authApi/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ASYNC_KEYS from '../../utils/async-keys';

const Signup = () => {
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
                    await AsyncStorage.setItem(ASYNC_KEYS.USER_TOKEN, response?.access_token);
                    dispatch(setCredentials({ token: response?.access_token, user: response?.user }));
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Theme.color.BACKGROUND_COLOR} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                <View style={styles.headerContainer}>
                    <LargeText textStyles={styles.title}>Create Account</LargeText>
                    <SmallText textStyles={styles.subTitle} color={Theme.color.COLOT_SUBTEXT}>
                        Join us to start scanning products!
                    </SmallText>
                </View>

                <View style={styles.inputContainer}>
                    <Input
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
                        placeholder="Create a password"
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

                <View style={styles.inputContainer}>
                    <Input
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChangeText={(text: string) => { setConfirmPassword(text); if (confirmPasswordError) setConfirmPasswordError(''); }}
                        error={confirmPasswordError}
                        secureTextEntry={secureConfirmEntry}
                        mandatory
                        renderRightIcon={
                            <TouchableOpacity onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}>
                                <Ionicons style={styles.icon} name={secureConfirmEntry ? "eye-off" : "eye"} size={20} color={Theme.color.COLOT_SUBTEXT} />
                            </TouchableOpacity>
                        }
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button onPress={handleSignup} isLoading={isLoading}>
                        SIGN UP
                    </Button>
                </View>

                <View style={styles.footerContainer}>
                    <SmallText color={Theme.color.COLOR_TEXT}>Already have an account? </SmallText>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <SmallText color={Theme.color.COLOR_BLUE} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                            Login
                        </SmallText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Signup;
