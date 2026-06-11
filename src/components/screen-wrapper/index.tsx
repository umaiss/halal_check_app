import React, { ReactNode, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ImageSourcePropType,
  ImageStyle,
  StatusBar,
  StatusBarProps,
  TouchableWithoutFeedback,
  View,
  Keyboard,
  ViewStyle,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import Theme from '../../theme/theme';
import { SmallText } from '../text';


interface ScreenWrapperProps {
  children: ReactNode;
  statusBarColor?: string;
  translucent?: boolean;
  scrollEnabled?: boolean;
  backgroundImage?: ImageSourcePropType;
  backgroundColor?: string;
  backgroundGradient?: ReactNode;
  headerUnScrollable?: () => ReactNode;
  footerUnScrollable?: () => ReactNode;
  barStyle?: StatusBarProps['barStyle'];
  imageStyle?: ImageStyle;
  containerStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  // 🔹 Header Props
  showHeader?: boolean;
  headerTitle?: string;
  onBackPress?: () => void;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;

  // 🔹 Scroll Props
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  statusBarColor = Theme.color.COLOR_WHITE,
  translucent = true,
  scrollEnabled = false,
  backgroundImage,
  backgroundColor = Theme.color.TRANSPARENT,
  backgroundGradient,
  headerUnScrollable = () => null,
  footerUnScrollable = () => null,
  barStyle = 'dark-content',
  imageStyle = {},
  containerStyle = {},
  contentContainerStyle = {},
  loading = false,
  error = null,
  onRetry,
  showHeader = false,
  headerTitle = '',
  onBackPress,
  rightIcon,
  onRightIconPress,
  onScroll,
  scrollEventThrottle,
}) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [isConnected, setIsConnected] = useState(true);
  const bannerAnim = useState(new Animated.Value(0))[0]; // animated height

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: isConnected ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isConnected, bannerAnim]);

  const FocusAwareStatusBar: React.FC<StatusBarProps> = props =>
    isFocused ? <StatusBar {...props} /> : null;

  const offlineHeight = bannerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40], // height anim
  });

  const InnerContent = (
      <View
        style={[
          styles.container,
          { backgroundColor },
          containerStyle,
          {
            paddingTop: translucent ? 0 : insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <FocusAwareStatusBar
          barStyle={barStyle}
          backgroundColor={statusBarColor}
          translucent={translucent}
        />

        {/* Internet Info Banner */}
        <Animated.View style={[styles.offlineBanner, { height: offlineHeight }]}>
          {!isConnected && <Text style={styles.offlineText}>No Internet Connection</Text>}
        </Animated.View>

        {/* 🔹 Custom Header */}
        {showHeader && (
          <View style={styles.headerContainer}>
            {/* Left Back Button */}
            <TouchableOpacity
              style={styles.leftIcon}
              onPress={onBackPress}
              disabled={!onBackPress}
            >
              {onBackPress && (
                <Icon name="arrow-back" size={24} color={Theme.color.COLOR_TEXT} />
              )}
            </TouchableOpacity>

            {/* Title */}
            <SmallText
              textStyles={styles.headerTitle}
              fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
              textAlign="center"
              size={4}
            >
              {headerTitle}
            </SmallText>

            {/* Right Icon */}
            {onRightIconPress ? <TouchableOpacity
              style={styles.rightIcon}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
            >
              {rightIcon || (
                // Optional: default right icon
                <Icon name="ellipsis-vertical" size={22} color={Theme.color.COLOR_TEXT} />
              )}
            </TouchableOpacity> : <View style={styles.rightIcon} />}
          </View>
        )}


        {headerUnScrollable()}

        {scrollEnabled ? (
          <ScrollView
            style={[styles.container, { backgroundColor }]}
            contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}

        {footerUnScrollable()}

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Theme.color.COLOR_BLUE} />
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
            {onRetry && (
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
  );

  const Content = scrollEnabled ? (
    InnerContent
  ) : (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {InnerContent}
    </TouchableWithoutFeedback>
  );

  const WrapperWithBackground = backgroundImage ? (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
      imageStyle={imageStyle}
    >
      {backgroundGradient}
      {Content}
    </ImageBackground>
  ) : backgroundGradient ? (
    <>
      {backgroundGradient}
      {Content}
    </>
  ) : (
    Content
  );

  return WrapperWithBackground;
};

export default ScreenWrapper;
