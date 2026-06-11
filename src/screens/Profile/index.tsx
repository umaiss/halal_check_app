import React, { useState } from 'react';
import { View, SafeAreaView, ScrollView, TouchableOpacity, Switch, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { logout } from '../../redux/slices/auth/authSlice';
import ASYNC_KEYS from '../../utils/async-keys';
import { RootState } from '../../redux/store';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import { useGetHistoryQuery } from '../../redux/scanApi/scanApi';
import { useDeleteAccountMutation, useGetProfileQuery } from '../../redux/authApi/authApi';
import { styles } from './styles';

function Profile() {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    
    // Fetch fresh user profile (points) on mount
    useGetProfileQuery();
    
    // Fetch live scan count from API
    const { data: apiHistory } = useGetHistoryQuery();
    const scanCount = apiHistory && Array.isArray(apiHistory) ? apiHistory.length : 0;

    // Toggle States (Push notifications and Keep Scan History are removed)
    const [darkMode, setDarkMode] = useState(false);

    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(ASYNC_KEYS.USER_TOKEN);
                            await AsyncStorage.removeItem(ASYNC_KEYS.USER_REFRESH_TOKEN);
                            await AsyncStorage.removeItem("UserInfo");
                            dispatch(logout());
                        } catch (e) {
                            console.error("Logout Error", e);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleLinkPress = (title: string) => {
        Alert.alert('Info', `${title} page is not implemented yet.`);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await deleteAccount().unwrap();
                            await AsyncStorage.removeItem(ASYNC_KEYS.USER_TOKEN);
                            await AsyncStorage.removeItem(ASYNC_KEYS.USER_REFRESH_TOKEN);
                            await AsyncStorage.removeItem("UserInfo");
                            dispatch(logout());
                            Alert.alert('Success', response.message || 'Your account has been deleted successfully.');
                        } catch (e: any) {
                            console.error("Delete Account Error", e);
                            Alert.alert('Error', e?.data?.message || e?.message || 'Failed to delete account. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.screenHeader}>
                <SmallText size={5.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK}>
                    My Profile
                </SmallText>
            </View>

            <ScrollView 
                style={styles.scrollContainer} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Premium User Card */}
                <View style={[styles.userCard, Theme.shadows.sh_glow_halal]}>
                    <View style={styles.userCardContent}>
                        <View style={styles.avatarBubble}>
                            <SmallText textStyles={styles.avatarText} size={6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                {userInitial}
                            </SmallText>
                        </View>
                        <View style={styles.userInfo}>
                            <SmallText textStyles={styles.userName} size={4.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                {user?.name || 'User'}
                            </SmallText>
                            <SmallText textStyles={styles.userEmail} size={3} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                                {user?.email || 'user@example.com'}
                            </SmallText>
                        </View>
                    </View>
                </View>

                {/* Stats Row - Displaying dynamic scan counter and user points */}
                <View style={styles.statsRow}>
                    <View style={[styles.statBox, Theme.shadows.sh_card]}>
                        <SmallText textStyles={{ color: Theme.color.COLOR_PRIMARY_GREEN }} size={5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                            {scanCount}
                        </SmallText>
                        <SmallText textStyles={styles.statLabel} size={2.6} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                            Total Scans
                        </SmallText>
                    </View>
                    <View style={[styles.statBox, Theme.shadows.sh_card]}>
                        <SmallText textStyles={{ color: '#F59E0B' }} size={5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                            {user?.points !== undefined ? user.points : 100}
                        </SmallText>
                        <SmallText textStyles={styles.statLabel} size={2.6} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                            My Points
                        </SmallText>
                    </View>
                </View>

                {/* Preferences Group */}
                <View style={styles.groupContainer}>
                    <SmallText textStyles={styles.groupTitle} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                        PREFERENCES
                    </SmallText>
                    <View style={[styles.groupCard, Theme.shadows.sh_card]}>
                        {/* Dark Mode */}
                        <View style={styles.settingsRow}>
                            <View style={styles.rowLabelContainer}>
                                <View style={[styles.iconWrapper, { backgroundColor: '#F3E8FF' }]}>
                                    <Icon name="moon-outline" size={18} color="#7C3AED" />
                                </View>
                                <SmallText textStyles={styles.rowLabel} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Dark Mode
                                </SmallText>
                            </View>
                            <Switch
                                trackColor={{ false: '#D1D5DB', true: '#A8DCC1' }}
                                thumbColor={darkMode ? Theme.color.COLOR_PRIMARY_GREEN : '#F3F4F6'}
                                ios_backgroundColor="#D1D5DB"
                                onValueChange={setDarkMode}
                                value={darkMode}
                            />
                        </View>
                    </View>
                </View>

                {/* Privacy & Support Group */}
                <View style={styles.groupContainer}>
                    <SmallText textStyles={styles.groupTitle} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                        HELP & SUPPORT
                    </SmallText>
                    <View style={[styles.groupCard, Theme.shadows.sh_card]}>
                        <TouchableOpacity style={styles.settingsLinkRow} onPress={() => handleLinkPress('Privacy Policy')} activeOpacity={0.7}>
                            <View style={styles.rowLabelContainer}>
                                <View style={[styles.iconWrapper, { backgroundColor: '#ECFDF5' }]}>
                                    <Icon name="shield-checkmark-outline" size={18} color="#059669" />
                                </View>
                                <SmallText textStyles={styles.rowLabel} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Privacy Policy
                                </SmallText>
                            </View>
                            <Icon name="chevron-forward" size={16} color={Theme.color.COLOR_MUTED_2} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.settingsLinkRow} onPress={() => handleLinkPress('Terms of Service')} activeOpacity={0.7}>
                            <View style={styles.rowLabelContainer}>
                                <View style={[styles.iconWrapper, { backgroundColor: '#FDF2F8' }]}>
                                    <Icon name="document-text-outline" size={18} color="#DB2777" />
                                </View>
                                <SmallText textStyles={styles.rowLabel} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Terms of Service
                                </SmallText>
                            </View>
                            <Icon name="chevron-forward" size={16} color={Theme.color.COLOR_MUTED_2} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.settingsLinkRow} onPress={() => handleLinkPress('Help & Support')} activeOpacity={0.7}>
                            <View style={styles.rowLabelContainer}>
                                <View style={[styles.iconWrapper, { backgroundColor: '#FFF7ED' }]}>
                                    <Icon name="help-circle-outline" size={18} color="#D97706" />
                                </View>
                                <SmallText textStyles={styles.rowLabel} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Help & Support
                                </SmallText>
                            </View>
                            <Icon name="chevron-forward" size={16} color={Theme.color.COLOR_MUTED_2} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.groupContainer}>
                    <SmallText textStyles={styles.groupTitle} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                        ACCOUNT
                    </SmallText>
                    <View style={[styles.groupCard, Theme.shadows.sh_card]}>
                        <TouchableOpacity style={styles.settingsLinkRow} onPress={handleLogout} activeOpacity={0.7} disabled={isDeleting}>
                            <View style={styles.rowLabelContainer}>
                                <View style={[styles.iconWrapper, { backgroundColor: Theme.color.COLOR_HARAM_BG }]}>
                                    <Icon name="log-out-outline" size={18} color={Theme.color.COLOR_HARAM} />
                                </View>
                                <SmallText textStyles={StyleSheet.flatten([styles.rowLabel, { color: Theme.color.COLOR_HARAM }])} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Logout
                                </SmallText>
                            </View>
                            <Icon name="chevron-forward" size={16} color={Theme.color.COLOR_HARAM} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.settingsLinkRow} onPress={handleDeleteAccount} activeOpacity={0.7} disabled={isDeleting}>
                            <View style={styles.rowLabelContainer}>
                                <View style={[styles.iconWrapper, { backgroundColor: '#FEE2E2' }]}>
                                    <Icon name="trash-outline" size={18} color="#EF4444" />
                                </View>
                                <SmallText textStyles={StyleSheet.flatten([styles.rowLabel, { color: '#EF4444' }])} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Delete Account
                                </SmallText>
                            </View>
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <Icon name="chevron-forward" size={16} color="#EF4444" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Profile;