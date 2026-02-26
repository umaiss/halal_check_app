import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native'
import React from 'react'
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ASYNC_KEYS from '../../utils/async-keys';

const Profile = ({ navigation }: any) => {
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem(ASYNC_KEYS.USER_TOKEN);
            dispatch(logout());
        } catch (e) {
            console.error("Logout Error", e);
        }
    };

    return (
        <SafeAreaView>
            <Text>Profile</Text>
            <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20 }}>
                <Text style={{ color: 'red', textAlign: 'center' }}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default Profile

const styles = StyleSheet.create({})