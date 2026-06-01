import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StackNavigator from './src/navigation/StackNavigator';
import { store } from './src/redux/store';
import ASYNC_KEYS from './src/utils/async-keys';
import Theme from './src/theme/theme';

import { setCredentials } from './src/redux/slices/auth/authSlice';
import BootSplash from 'react-native-bootsplash';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // 1. Check Onboarding Status
      const onboardingStatus = await AsyncStorage.getItem(ASYNC_KEYS.ONBOARDING_COMPLETED);
      console.log('Onboarding Status:', onboardingStatus);
      setIsOnboardingCompleted(onboardingStatus === 'true');

      // 2. Check Tokens & User Info
      const token = await AsyncStorage.getItem(ASYNC_KEYS.USER_TOKEN);
      const refreshToken = await AsyncStorage.getItem(ASYNC_KEYS.USER_REFRESH_TOKEN);
      const userInfoStr = await AsyncStorage.getItem("UserInfo");
      const user = userInfoStr ? JSON.parse(userInfoStr) : { id: '1', name: 'User', email: 'user@example.com' };

      console.log('Bootstrap Token loaded:', token);
      console.log('Bootstrap Refresh Token loaded:', refreshToken);

      if (token) {
        // Dispatch to Redux
        store.dispatch(setCredentials({ token, refreshToken, user }));
      }
    } catch (error) {

      console.error('Error bootstrapping app:', error);
    } finally {
      console.log('Loading completed');
      setIsLoading(false);
      BootSplash.hide({ fade: true });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.color.COLOR_BLUE} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <StackNavigator isOnboardingCompleted={isOnboardingCompleted} />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Theme.color.COLOR_WHITE,
    flex: 1,
    justifyContent: 'center',
  },
});

export default App;
