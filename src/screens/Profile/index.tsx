import React from 'react';
import { View, SafeAreaView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../redux/slices/auth/authSlice';
import ASYNC_KEYS from '../../utils/async-keys';
import { RootState } from '../../redux/store';
import { LargeText, MediumText, Button } from '../../components';
import Theme from '../../theme/theme';
import { styles } from './styles';

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

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

    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <LargeText textStyles={styles.avatarPlaceholder}>{userInitial}</LargeText>
                </View>
                <LargeText textStyles={styles.userName}>{user?.name || 'User'}</LargeText>
                <MediumText color={Theme.color.COLOT_SUBTEXT} textStyles={styles.userEmail}>
                    {user?.email || 'user@example.com'}
                </MediumText>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Button
                        onPress={handleLogout}
                        variant="secondary"
                        containerStyle={styles.logoutButton}
                        textStyle={styles.logoutText}
                    >
                        Logout
                    </Button>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Profile;