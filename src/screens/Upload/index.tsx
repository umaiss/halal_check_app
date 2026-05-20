import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import { styles } from './styles';
import { uploadImageToSupabase } from '../../utils/imageUpload';
import CryptoJS from 'crypto-js';
import Input from '../../components/input';
import { height } from '../../utils/dimensions';

type UploadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Upload'>;

type ImageType = 'front' | 'back' | 'ingredients';

const Upload = () => {
    const navigation = useNavigation<UploadScreenNavigationProp>();
    const [frontImage, setFrontImage] = useState<Asset | null>(null);
    const [backImage, setBackImage] = useState<Asset | null>(null);
    const [ingredientsImage, setIngredientsImage] = useState<Asset | null>(null);
    const [productName, setProductName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleImageSelection = async (type: ImageType, source: 'camera' | 'gallery') => {
        const options: any = {
            mediaType: 'photo',
            quality: 0.6,
            maxWidth: 1200,
            maxHeight: 1200,
            selectionLimit: 1,
        };

        try {
            const result = source === 'camera'
                ? await launchCamera(options)
                : await launchImageLibrary(options);

            if (result.didCancel) return;
            if (result.errorCode) {
                Alert.alert('Error', result.errorMessage || 'Failed to select image');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                switch (type) {
                    case 'front':
                        setFrontImage(asset);
                        break;
                    case 'back':
                        setBackImage(asset);
                        break;
                    case 'ingredients':
                        setIngredientsImage(asset);
                        break;
                }
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'Failed to process image selection');
        }
    };

    const showImageOptions = (type: ImageType) => {
        Alert.alert(
            'Select Image',
            'Choose an option',
            [
                {
                    text: 'Take Photo',
                    onPress: () => handleImageSelection(type, 'camera'),
                },
                {
                    text: 'Choose from Gallery',
                    onPress: () => handleImageSelection(type, 'gallery'),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const processImageWithTextRecognition = async (imagePath: string) => {
        try {
            console.log('Processing image:', imagePath);
            const result = await TextRecognition.recognize(imagePath);

            if (result && result.text) {
                return result.text
                    .replace(/\s+/g, ' ')
                    .replace(/\n+/g, ' ')
                    .trim();
            }

            return null;
        } catch (error) {
            console.error('Error processing image with text recognition:', error);
            throw error;
        }
    };


    const handleProcess = async () => {
        if (!ingredientsImage?.uri) {
            Alert.alert('Required', 'Please upload or capture the ingredients image.');
            return;
        }

        setIsProcessing(true);
        try {
            // Create an array of promises for parallel execution
            const uploadPromises: Promise<string>[] = [];

            // Helper to handle safe upload
            const safeUpload = async (uri: string | undefined): Promise<string> => {
                if (!uri) return '';
                try {
                    return await uploadImageToSupabase(uri, 'halal-images', productName);
                } catch (e) {
                    console.error('Failed to upload image:', e);
                    return ''; // Default to empty string on failure instead of crashing the whole flow
                }
            };

            // Queue up uploads concurrently
            const frontUploadPromise = safeUpload(frontImage?.uri);
            const backUploadPromise = safeUpload(backImage?.uri);
            const ingredientsUploadPromise = safeUpload(ingredientsImage?.uri);

            // Queue up text extraction concurrently with the uploads
            const imagePath = Platform.OS === 'android'
                ? ingredientsImage.uri
                : ingredientsImage.uri.replace('file://', '');

            const textExtractionPromise = processImageWithTextRecognition(imagePath);

            // Await all promises simultaneously
            const [frontUrl, backUrl, ingredientsUrl, extractedText] = await Promise.all([
                frontUploadPromise,
                backUploadPromise,
                ingredientsUploadPromise,
                textExtractionPromise
            ]);

            if (extractedText) {
                // Compute SHA-256 hash using the extracted text
                const ingredients_hash = CryptoJS.SHA256(extractedText).toString(CryptoJS.enc.Hex);

                navigation.navigate('IngredientsResult', {
                    ingredients: extractedText,
                    ingredients_hash,
                    productName,
                    imageUri: ingredientsImage.uri, // still pass local URI for preview
                    frontImage: frontUrl || undefined,
                    backImage: backUrl || undefined,
                    ingredientsImage: ingredientsUrl || undefined,
                });
            } else {
                Alert.alert('No Text Detected', 'Could not detect text in the ingredients image. Please try again with a clearer image.');
            }
        } catch (error) {
            console.error('Error processing ingredients:', error);
            Alert.alert('Error', 'Failed to process ingredients image. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };


    const renderImageButton = (type: ImageType, image: Asset | null, label: string, required: boolean = false) => (
        <TouchableOpacity
            style={styles.imageButton}
            onPress={() => showImageOptions(type)}
            activeOpacity={0.8}
        >
            {image?.uri ? (
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
            ) : (
                <View style={styles.placeholderContainer}>
                    <Icon name="camera-outline" size={32} color={Theme.color.COLOR_BLUE} />
                    <SmallText
                        size={3.5}
                        color={Theme.color.COLOT_SUBTEXT}
                        textStyles={styles.placeholderText}
                    >
                        {label} {required && '(Required)'}
                    </SmallText>
                </View>
            )}
            {image && (
                <View style={styles.editIconContainer}>
                    <Icon name="pencil" size={16} color={Theme.color.COLOR_WHITE} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color={Theme.color.COLOR_TEXT} />
                </TouchableOpacity>
                <SmallText
                    size={5}
                    fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                    color={Theme.color.COLOR_TEXT}
                >
                    Upload Images
                </SmallText>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <SmallText
                    size={3.5}
                    color={Theme.color.COLOT_SUBTEXT}
                    textStyles={styles.description}
                >
                    Please upload photos of the product. The ingredients photo is required for halal verification.
                </SmallText>

                <View style={{ marginBottom: height(2) }}>
                    <Input
                        label="Product Name"
                        placeholder="Enter product name (e.g. Lay's Classic)"
                        value={productName}
                        onChangeText={setProductName}
                        containerStyle={{ marginHorizontal: 0 }}
                    />
                </View>

                <View style={styles.gridContainer}>
                    {renderImageButton('front', frontImage, 'Front Image')}
                    {renderImageButton('back', backImage, 'Back Image')}
                </View>

                <View style={styles.fullWidthContainer}>
                    {renderImageButton('ingredients', ingredientsImage, 'Ingredients Image', true)}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.processButton,
                        (!ingredientsImage || isProcessing) && styles.processButtonDisabled
                    ]}
                    onPress={handleProcess}
                    disabled={!ingredientsImage || isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color={Theme.color.COLOR_WHITE} />
                    ) : (
                        <>
                            <Icon name="checkmark-circle" size={24} color={Theme.color.COLOR_WHITE} />
                            <SmallText
                                size={4}
                                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                color={Theme.color.COLOR_WHITE}
                                textStyles={styles.buttonText}
                            >
                                Check Ingredients
                            </SmallText>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Upload;
