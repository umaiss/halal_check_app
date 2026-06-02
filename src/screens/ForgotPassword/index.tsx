import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, StatusBar, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { Input, Button, LargeText, SmallText } from '../../components';
import Theme from '../../theme/theme';
import { useForgotPasswordMutation } from '../../redux/authApi/authApi';
import styles from '../Login/styles';

function ForgotPassword() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const validate = () => {
        if (!email) {
            setEmailError('Email is required');
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSendCode = async () => {
        if (!validate()) return;
        try {
            const response = await forgotPassword({ email }).unwrap();
            Alert.alert('Code Sent', response?.message || 'Verification code sent successfully.', [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('ResetPassword', { email }),
                }
            ]);
        } catch (err: any) {
            const errorMessage = err?.data?.message || err?.data?.error || 'Failed to send reset code. Please try again.';
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
                        <LargeText textStyles={styles.title}>Forgot Password</LargeText>
                        <SmallText textStyles={styles.subTitle} color="rgba(255, 255, 255, 0.65)">
                            Enter your email and we&apos;ll send you a 6-digit verification code
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
                                onChangeText={(text: string) => { setEmail(text.toLowerCase()); if (emailError) setEmailError(''); }}
                                error={emailError}
                                keyboardType="email-address"
                                mandatory
                                inputProps={{ autoCapitalize: 'none' }}
                            />
                        </View>

                        <View style={[styles.buttonContainer, { marginTop: 24 }]}>
                            <Button 
                                onPress={handleSendCode} 
                                isLoading={isLoading}
                                buttonStyle={styles.buttonStyle}
                                labelStyle={{ color: '#074330', fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD }}
                            >
                                Send Reset Code
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

export default ForgotPassword;
