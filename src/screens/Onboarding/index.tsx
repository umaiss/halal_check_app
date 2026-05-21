import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import ASYNC_KEYS from '../../utils/async-keys';
import { height, width } from '../../utils/dimensions';

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const SCREEN_WIDTH = width(100);

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Scan ingredients in seconds',
    description: 'Point your camera at any ingredients list to scan it instantly.',
    color: Theme.color.COLOR_PRIMARY_GREEN,
  },
  {
    id: 2,
    title: 'AI-powered analysis',
    description: 'Our smart system scans and analyzes ingredients against verified databases.',
    color: Theme.color.COLOR_PRIMARY_GREEN,
  },
  {
    id: 3,
    title: 'Eat with confidence',
    description: 'Get clear verification: Halal, Haram, or Doubtful. Simple, trusted answers.',
    color: Theme.color.COLOR_PRIMARY_GREEN,
  },
];

function Onboarding() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (event: any) => {
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

  const renderSlideIllustration = (slideId: number) => {
    if (slideId === 1) {
      return (
        <View style={styles.illustrationContainer}>
          {/* Product box */}
          <View style={styles.productBox}>
            <View style={styles.productHeader} />
            <View style={styles.productLine} />
            <View style={styles.productLineShort} />
            <View style={styles.productLabelBox}>
              <View style={styles.productLabelLine} />
              <View style={styles.productLabelLine} />
              <View style={styles.productLabelLine} />
            </View>
          </View>
          {/* Scanning viewport overlay */}
          <View style={styles.scanViewport}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {/* Scanning line */}
            <View style={styles.scanLine} />
          </View>
        </View>
      );
    } else if (slideId === 2) {
      return (
        <View style={styles.illustrationContainer}>
          <View style={styles.ingredientStack}>
            {/* Row 1: Halal */}
            <View style={[styles.ingredientRow, styles.shadowCard]}>
              <View style={styles.ingredientInfo}>
                <View style={[styles.statusDot, { backgroundColor: Theme.color.COLOR_HALAL }]} />
                <SmallText size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color={Theme.color.COLOR_INK}>
                  Sugar
                </SmallText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: Theme.color.COLOR_HALAL_BG }]}>
                <SmallText size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_HALAL}>
                  HALAL
                </SmallText>
              </View>
            </View>

            {/* Row 2: Doubtful */}
            <View style={[styles.ingredientRow, styles.shadowCard]}>
              <View style={styles.ingredientInfo}>
                <View style={[styles.statusDot, { backgroundColor: Theme.color.COLOR_DOUBTFUL }]} />
                <SmallText size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color={Theme.color.COLOR_INK}>
                  E471 (Emulsifier)
                </SmallText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: Theme.color.COLOR_DOUBTFUL_BG }]}>
                <SmallText size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_DOUBTFUL}>
                  DOUBTFUL
                </SmallText>
              </View>
            </View>

            {/* Row 3: Haram */}
            <View style={[styles.ingredientRow, styles.shadowCard]}>
              <View style={styles.ingredientInfo}>
                <View style={[styles.statusDot, { backgroundColor: Theme.color.COLOR_HARAM }]} />
                <SmallText size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color={Theme.color.COLOR_INK}>
                  Gelatin (Pork)
                </SmallText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: Theme.color.COLOR_HARAM_BG }]}>
                <SmallText size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_HARAM}>
                  HARAM
                </SmallText>
              </View>
            </View>
          </View>
        </View>
      );
    } else if (slideId === 3) {
      return (
        <View style={styles.illustrationContainer}>
          {/* Layered circle trust badge */}
          <View style={styles.badgeOuterCircle}>
            <View style={styles.badgeMiddleCircle}>
              <View style={[styles.badgeInnerCircle, Theme.shadows.sh_card]}>
                <Icon name="checkmark-circle" size={width(18)} color={Theme.color.COLOR_PRIMARY_GREEN} />
              </View>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <SmallText textStyles={styles.skipText} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
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
            {/* Graphic Illustration */}
            {renderSlideIllustration(slide.id)}

            {/* Title */}
            <SmallText
              textStyles={styles.title}
              size={6}
              fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
              color={Theme.color.COLOR_INK}
            >
              {slide.title}
            </SmallText>

            {/* Description */}
            <SmallText textStyles={styles.description} size={3.8} color={Theme.color.COLOR_MUTED}>
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
          style={[styles.button, Theme.shadows.sh_button]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <SmallText
            textStyles={styles.buttonText}
            size={4.2}
            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </SmallText>
          {currentSlide < slides.length - 1 && (
            <Icon name="arrow-forward" size={18} color={Theme.color.COLOR_WHITE} style={styles.buttonIcon} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.color.COLOR_BG,
    flex: 1,
  },
  skipButton: {
    padding: 8,
    position: 'absolute',
    right: width(5.3),
    top: height(7.4),
    zIndex: 10,
  },
  skipText: {
    color: Theme.color.COLOR_MUTED,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width(10.6),
    paddingTop: height(8),
    width: SCREEN_WIDTH,
  },
  title: {
    marginBottom: height(2),
    paddingHorizontal: width(2),
    textAlign: 'center',
  },
  description: {
    lineHeight: 22,
    paddingHorizontal: width(4),
    textAlign: 'center',
  },
  paginationContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: height(2),
  },
  paginationDot: {
    backgroundColor: '#D6DCD9',
    borderRadius: 3,
    height: 6,
    marginHorizontal: 4,
    width: 6,
  },
  paginationDotActive: {
    backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
    borderRadius: 3,
    height: 6,
    width: 20,
  },
  buttonContainer: {
    paddingBottom: height(6),
    paddingHorizontal: width(8),
  },
  button: {
    alignItems: 'center',
    backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: height(1.8),
    width: '100%',
  },
  buttonText: {
    color: Theme.color.COLOR_WHITE,
  },
  buttonIcon: {
    marginLeft: 8,
  },

  // Illustrations styling
  illustrationContainer: {
    alignItems: 'center',
    height: height(30),
    justifyContent: 'center',
    marginBottom: height(5),
    width: '100%',
  },
  productBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#ECEFF1',
    borderRadius: 16,
    borderWidth: 1.5,
    height: height(20),
    justifyContent: 'center',
    padding: 12,
    width: width(36),
    ...Theme.shadows.sh_card,
  },
  productHeader: {
    backgroundColor: '#D0DDD7',
    borderRadius: 5,
    height: 10,
    marginBottom: 12,
    width: width(18),
  },
  productLine: {
    backgroundColor: '#F0F4F2',
    borderRadius: 3,
    height: 6,
    marginBottom: 6,
    width: width(24),
  },
  productLineShort: {
    backgroundColor: '#F0F4F2',
    borderRadius: 3,
    height: 6,
    marginBottom: 12,
    width: width(16),
  },
  productLabelBox: {
    backgroundColor: '#F7FAF8',
    borderColor: '#E8EFEA',
    borderRadius: 8,
    borderWidth: 1,
    height: height(6),
    justifyContent: 'center',
    padding: 6,
    width: '100%',
  },
  productLabelLine: {
    backgroundColor: '#D6DDD9',
    borderRadius: 2,
    height: 4,
    marginBottom: 4,
    width: '90%',
  },
  scanViewport: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderWidth: 2,
    height: height(24),
    justifyContent: 'center',
    position: 'absolute',
    width: width(48),
  },
  corner: {
    borderColor: Theme.color.COLOR_PRIMARY_GREEN,
    height: 24,
    position: 'absolute',
    width: 24,
  },
  cornerTL: {
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
    borderTopWidth: 4,
    left: 0,
    top: 0,
  },
  cornerTR: {
    borderRightWidth: 4,
    borderTopRightRadius: 10,
    borderTopWidth: 4,
    right: 0,
    top: 0,
  },
  cornerBL: {
    borderBottomLeftRadius: 10,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: 0,
    left: 0,
  },
  cornerBR: {
    borderBottomRightRadius: 10,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: 0,
    right: 0,
  },
  scanLine: {
    backgroundColor: '#3CD89B',
    borderRadius: 2,
    elevation: 6,
    height: 4,
    shadowColor: '#3CD89B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    width: '90%',
  },
  ingredientStack: {
    paddingHorizontal: width(4),
    width: '100%',
  },
  ingredientRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#ECEFF1',
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  ingredientInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 10,
    width: 8,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeOuterCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(14, 121, 85, 0.04)',
    borderRadius: width(22),
    height: width(44),
    justifyContent: 'center',
    width: width(44),
  },
  badgeMiddleCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(14, 121, 85, 0.08)',
    borderRadius: width(17),
    height: width(34),
    justifyContent: 'center',
    width: width(34),
  },
  badgeInnerCircle: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: width(12),
    height: width(24),
    justifyContent: 'center',
    width: width(24),
  },
  shadowCard: {
    elevation: 2,
    shadowColor: '#0F1411',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
});

export default Onboarding;

