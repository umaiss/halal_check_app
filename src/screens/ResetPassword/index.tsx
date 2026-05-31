import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, StatusBar, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { Input, Button, LargeText, SmallText } from '../../components';
import Theme from '../../theme/theme';
import { useResetPasswordMutation } from '../../redux/authApi/authApi';
import styles from '../Login/styles';

type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

function ResetPassword() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<ResetPasswordRouteProp>();
    const email = route.params?.email || '';

    const [resetPassword, { isLoading }] = useResetPasswordMutation();
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [codeError, setCodeError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const validate = () => {
        let isValid = true;

        if (!code) {
            setCodeError('Verification code is required');
            isValid = false;
        } else if (code.length !== 6) {
            setCodeError('Verification code must be 6 digits');
            isValid = false;
        } else {
            setCodeError('');
        }

        if (!password) {
            setPasswordError('New password is required');
            isValid = false;
        } else if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            isValid = false;
        } else {
            setPasswordError('');
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        } else {
            setConfirmPasswordError('');
        }

        return isValid;
    };

    const handleResetPassword = async () => {
        if (!validate()) return;
        try {
            const response = await resetPassword({ email, code, password }).unwrap();
            Alert.alert('Success', response?.message || 'Password reset successfully.', [
                {
                    text: 'Login',
                    onPress: () => navigation.navigate('Login'),
                }
            ]);
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.data?.error || 'Failed to reset password. Please try again.';
            Alert.alert('Error', errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#074330" />
            
            {/* Background glowing blobs */}
            <View style={styles.glowBlob1} />
            <View style={styles.glowBlob2} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Back Button */}
                <TouchableOpacity 
                    style={{ padding: 16, width: 60 }} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <LargeText textStyles={styles.title}>Reset Password</LargeText>
                        <SmallText textStyles={styles.subTitle} color="rgba(255, 255, 255, 0.65)">
                            Enter the code sent to {email} and your new password
                        </SmallText>
                    </View>

                    {/* Glassmorphic Form Card */}
                    <View style={styles.glassCard}>
                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="Verification Code"
                                placeholder="Enter 6-digit code"
                                value={code}
                                onChangeText={(text: string) => { setCode(text); if (codeError) setCodeError(''); }}
                                error={codeError}
                                keyboardType="number-pad"
                                maxLength={6}
                                mandatory
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="New Password"
                                placeholder="Enter new password"
                                value={password}
                                onChangeText={(text: string) => { setPassword(text); if (passwordError) setPasswordError(''); }}
                                error={passwordError}
                                secureTextEntry={secureTextEntry}
                                rightIcon={
                                    <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                                        <Ionicons 
                                            name={secureTextEntry ? "eye-off-outline" : "eye-outline"} 
                                            size={20} 
                                            color="rgba(255, 255, 255, 0.6)" 
                                        />
                                    </TouchableOpacity>
                                }
                                mandatory
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Input
                                variant="glass"
                                label="Confirm New Password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChangeText={(text: string) => { setConfirmPassword(text); if (confirmPasswordError) setConfirmPasswordError(''); }}
                                error={confirmPasswordError}
                                secureTextEntry={secureTextEntry}
                                mandatory
                            />
                        </View>

                        <View style={[styles.buttonContainer, { marginTop: 24 }]}>
                            <Button 
                                onPress={handleResetPassword} 
                                isLoading={isLoading}
                                buttonStyle={styles.buttonStyle}
                                labelStyle={{ color: '#074330', fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD }}
                            >
                                Reset Password
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

export default ResetPassword;
