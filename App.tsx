import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import StackNavigator from './src/navigation/StackNavigator';
import { store } from './src/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ASYNC_KEYS from './src/utils/async-keys';
import Theme from './src/theme/theme';

import { setCredentials } from './src/redux/slices/auth/authSlice';

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

      // 2. Check Token
      const token = await AsyncStorage.getItem(ASYNC_KEYS.USER_TOKEN);
      console.log('Token:', token);
      if (token) {

        // Dispatch to Redux
        // Note: In a real app, you might validate the token with an API call here
        store.dispatch(setCredentials({ token, user: { id: '1', name: 'User', email: 'user@example.com' } }));
      }
    } catch (error) {

      console.error('Error bootstrapping app:', error);
    } finally {
      console.log('Loading completed');
      setIsLoading(false);
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.color.COLOR_WHITE,
  },
});

export default App;
