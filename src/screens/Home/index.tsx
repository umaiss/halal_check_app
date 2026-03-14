import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    TextInput,
    Alert,
    Platform,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { launchImageLibrary } from 'react-native-image-picker';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types/RootParamList';
import TextRecognition from '@react-native-ml-kit/text-recognition';

type HomeNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<BottomTabParamList, 'Home'>,
    NativeStackNavigationProp<RootStackParamList>
>;

function Home() {
    const navigation = useNavigation<HomeNavigationProp>();
    const layout = useWindowDimensions();
    const [ingredientText, setIngredientText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'camera', title: 'Camera', icon: 'camera' },
        { key: 'type', title: 'Type', icon: 'text' },
    ]);

    const processImageWithTextRecognition = async (imagePath: string) => {
        try {
            console.log('Processing image:', imagePath);
            const result: any = await TextRecognition.recognize(imagePath);
            console.log('Text Recognition Result:', JSON.stringify(result, null, 2));

            let extractedText = '';

            if (result && result.text) {
                extractedText = result.text.trim();
            } else if (result && result.blocks && Array.isArray(result.blocks) && result.blocks.length > 0) {
                extractedText = result.blocks
                    .map((block: any) => {
                        if (typeof block === 'string') return block;
                        return block.text || block.blockText || '';
                    })
                    .filter((text: string) => text && text.length > 0)
                    .join(' ');
            }

            if (extractedText.length > 0) {
                const cleanedText = extractedText
                    .replace(/\s+/g, ' ')
                    .replace(/\n+/g, ' ')
                    .trim();

                console.log('Cleaned extracted text:', cleanedText);
                return cleanedText;
            }

            return null;
        } catch (error) {
            console.error('Error processing image with text recognition:', error);
            throw error;
        }
    };

    const handleOpenCamera = async () => {
        try {
            navigation.navigate('Upload');
        } catch (error) {
            console.error('Error opening camera:', error);
            Alert.alert('Error', 'Failed to process image. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleSelectFromGallery = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: 1,
            });

            if (result.didCancel) {
                console.log('User cancelled image picker');
                return;
            }

            if (result.errorCode) {
                Alert.alert('Gallery Error', result.errorMessage || 'Failed to open gallery');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.uri) {
                    setIsProcessing(true);
                    const imagePath = Platform.OS === 'android'
                        ? asset.uri
                        : asset.uri.replace('file://', '');

                    const extractedText = await processImageWithTextRecognition(imagePath);

                    if (extractedText) {
                        navigation.navigate('IngredientsResult', {
                            ingredients: extractedText,
                            imageUri: asset.uri,
                        });
                    } else {
                        Alert.alert('No Text Detected', 'Please try again with a clearer image.');
                    }
                    setIsProcessing(false);
                }
            }
        } catch (error) {
            console.error('Error selecting from gallery:', error);
            Alert.alert('Error', 'Failed to process image. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleProcessText = () => {
        if (ingredientText.trim().length === 0) {
            Alert.alert('Empty Input', 'Please enter some ingredients to check.');
            return;
        }

        navigation.navigate('IngredientsResult', {
            ingredients: ingredientText.trim(),
            imageUri: undefined,
        });
    };

    // Camera Tab Route
    const CameraRoute = () => (
        <View style={styles.cameraTab}>
            <View style={styles.iconPreview}>
                <Icon name="camera-outline" size={80} color={Theme.color.COLOR_BLUE} />
            </View>

            <SmallText
                size={4.5}
                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                color={Theme.color.COLOR_TEXT}
                textStyles={styles.tabTitle}
            >
                Capture Ingredients
            </SmallText>

            <SmallText
                size={3.5}
                color={Theme.color.COLOT_SUBTEXT}
                textStyles={styles.tabDescription}
            >
                Take a photo or select from your gallery to scan ingredient labels
            </SmallText>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={handleOpenCamera}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonIconContainer}>
                        <Icon name="camera" size={28} color={Theme.color.COLOR_WHITE} />
                    </View>
                    <View style={styles.buttonTextContainer}>
                        <SmallText
                            size={4.2}
                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                            color={Theme.color.COLOR_WHITE}
                        >
                            Upload
                        </SmallText>
                        <SmallText
                            size={3}
                            color={Theme.color.COLOR_WHITE}
                            textStyles={styles.buttonSubtext}
                        >
                            Take a photo now
                        </SmallText>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.secondaryButton]}
                    onPress={handleSelectFromGallery}
                    disabled={isProcessing}
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonIconContainer}>
                        <Icon name="images" size={28} color={Theme.color.COLOR_BLUE} />
                    </View>
                    <View style={styles.buttonTextContainer}>
                        <SmallText
                            size={4.2}
                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                            color={Theme.color.COLOR_BLUE}
                        >
                            Select from Gallery
                        </SmallText>
                        <SmallText
                            size={3}
                            color={Theme.color.COLOT_SUBTEXT}
                            textStyles={styles.buttonSubtext}
                        >
                            Choose an existing photo
                        </SmallText>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Type Tab Route
    const TypeRoute = () => (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.typeTab}>
                <View style={styles.iconPreview}>
                    <Icon name="create-outline" size={80} color={Theme.color.COLOR_YELLOW} />
                </View>

                <SmallText
                    size={4.5}
                    fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                    color={Theme.color.COLOR_TEXT}
                    textStyles={styles.tabTitle}
                >
                    Type Ingredients
                </SmallText>

                <SmallText
                    size={3.5}
                    color={Theme.color.COLOT_SUBTEXT}
                    textStyles={styles.tabDescription}
                >
                    Enter ingredients manually to check if they're halal
                </SmallText>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="e.g., flour, sugar, gelatin, lecithin..."
                        placeholderTextColor={Theme.color.COLOT_SUBTEXT}
                        multiline
                        numberOfLines={8}
                        value={ingredientText}
                        onChangeText={setIngredientText}
                        textAlignVertical="top"
                    />
                    <View style={styles.characterCounter}>
                        <SmallText
                            size={3}
                            color={Theme.color.COLOT_SUBTEXT}
                        >
                            {ingredientText.length} characters
                        </SmallText>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, ingredientText.trim().length === 0 && styles.submitButtonDisabled]}
                    onPress={handleProcessText}
                    disabled={ingredientText.trim().length === 0}
                    activeOpacity={0.8}
                >
                    <Icon name="checkmark-circle" size={24} color={Theme.color.COLOR_WHITE} />
                    <SmallText
                        size={4.2}
                        fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                        color={Theme.color.COLOR_WHITE}
                        textStyles={styles.submitButtonText}
                    >
                        Check Ingredients
                    </SmallText>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderScene = SceneMap({
        camera: CameraRoute,
        type: TypeRoute,
    });

    const renderTabBar = (props: any) => (
        <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            renderLabel={({ route, focused }: { route: any; focused: boolean }) => (
                <View style={styles.tabLabelContainer}>
                    <Icon
                        name={route.icon}
                        size={20}
                        color={focused ? Theme.color.COLOR_WHITE : Theme.color.COLOT_SUBTEXT}
                    />
                    <SmallText
                        size={3.8}
                        fontFamily={focused ? Theme.fonts.FONT_NUNITO_EXTRABOLD : Theme.fonts.FONT_NUNITO_MEDIUM}
                        color={focused ? Theme.color.COLOR_WHITE : Theme.color.COLOT_SUBTEXT}
                        textStyles={styles.tabText}
                    >
                        {route.title}
                    </SmallText>
                </View>
            )}
        />
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <SmallText
                    size={6}
                    fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                    color={Theme.color.COLOR_TEXT}
                >
                    Ingredient Checker
                </SmallText>
                <SmallText
                    size={3.5}
                    color={Theme.color.COLOT_SUBTEXT}
                    textStyles={styles.subtitle}
                >
                    Scan or type ingredients to verify
                </SmallText>
            </View>

            {/* TabView */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    subtitle: {
        marginTop: 4,
    },
    tabBar: {
        backgroundColor: `${Theme.color.COLOR_STROKE}80`,
        marginHorizontal: 24,
        marginBottom: 20,
        borderRadius: 16,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabIndicator: {
        backgroundColor: Theme.color.COLOR_BLUE,
        height: '90%',
        marginVertical: 4,
        marginHorizontal: 4,
        borderRadius: 12,
        shadowColor: Theme.color.COLOR_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    tabLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    tabText: {
        marginLeft: 4,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    cameraTab: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 24,
    },
    typeTab: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    iconPreview: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: `${Theme.color.COLOR_BLUE}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    tabTitle: {
        textAlign: 'center',
        marginBottom: 8,
    },
    tabDescription: {
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButton: {
        backgroundColor: Theme.color.COLOR_BLUE,
    },
    secondaryButton: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderWidth: 2,
        borderColor: Theme.color.COLOR_STROKE,
    },
    buttonIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    buttonTextContainer: {
        flex: 1,
    },
    buttonSubtext: {
        marginTop: 2,
        opacity: 0.8,
    },
    inputContainer: {
        width: '100%',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Theme.color.COLOR_STROKE,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    textInput: {
        padding: 16,
        fontSize: 16,
        fontFamily: Theme.fonts.FONT_NUNITO_REGULAR,
        color: Theme.color.COLOR_TEXT,
        minHeight: 160,
        maxHeight: 240,
    },
    characterCounter: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        alignItems: 'flex-end',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        gap: 8,
        width: '100%',
        shadowColor: Theme.color.COLOR_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        backgroundColor: Theme.color.COLOR_STROKE,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        marginLeft: 4,
    },
});

export default Home;
