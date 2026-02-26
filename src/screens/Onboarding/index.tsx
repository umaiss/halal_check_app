import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ASYNC_KEYS from '../../utils/async-keys';

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to Halal App',
    description: 'Scan product ingredients instantly and verify if they are halal, haram, or doubtful.',
    icon: 'scan-outline',
    color: Theme.color.COLOR_BLUE,
  },
  {
    id: 2,
    title: 'Quick Verification',
    description: 'Get instant halal status verification for each ingredient with detailed explanations.',
    icon: 'checkmark-circle-outline',
    color: '#22C55E',
  },
  {
    id: 3,
    title: 'Stay Informed',
    description: 'Make informed decisions about the products you consume with our comprehensive halal database.',
    icon: 'shield-checkmark-outline',
    color: Theme.color.COLOR_PURPLE,
  },
];

function Onboarding() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentSlide(slideIndex);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      scrollViewRef.current?.scrollTo({
        x: nextSlide * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentSlide(nextSlide);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem(ASYNC_KEYS.ONBOARDING_COMPLETED, 'true');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <SmallText textStyles={styles.skipText} size={3}>
            Skip
          </SmallText>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            {/* Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor: `${slide.color}15` }]}>
              <Icon name={slide.icon} size={80} color={slide.color} />
            </View>

            {/* Title */}
            <SmallText
              textStyles={styles.title}
              size={6}
              fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
            >
              {slide.title}
            </SmallText>

            {/* Description */}
            <SmallText textStyles={styles.description} size={3.5}>
              {slide.description}
            </SmallText>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentSlide === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* Action Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: slides[currentSlide].color }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <SmallText
            textStyles={styles.buttonText}
            size={3.5}
            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </SmallText>
          {currentSlide < slides.length - 1 && (
            <Icon name="arrow-forward" size={20} color={Theme.color.COLOR_WHITE} style={styles.buttonIcon} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.color.COLOR_WHITE,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: Theme.color.COLOT_SUBTEXT,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    color: Theme.color.COLOR_TEXT,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  description: {
    color: Theme.color.COLOT_SUBTEXT,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: Theme.color.COLOR_BLUE,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: Theme.color.COLOR_WHITE,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default Onboarding;

