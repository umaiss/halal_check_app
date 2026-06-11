import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Image,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import CryptoJS from 'crypto-js';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useSelector } from 'react-redux';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import { RootState } from '../../redux/store';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import Theme from '../../theme/theme';
import { SmallText } from '../../components/text';
import Input from '../../components/input';
import ScreenWrapper from '../../components/screen-wrapper';
import { uploadImageToBackend } from '../../utils/imageUpload';
import { height, width } from '../../utils/dimensions';

type PreviewScanRouteProp = RouteProp<RootStackParamList, 'PreviewScan'>;
type PreviewScanNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PreviewScan'>;

function PreviewScan() {
    const navigation = useNavigation<PreviewScanNavigationProp>();
    const route = useRoute<PreviewScanRouteProp>();
    const { imageUri, productName: initialProductName, scanFailed } = route.params;
    const { user } = useSelector((state: RootState) => state.auth);

    const [currentImageUri, setCurrentImageUri] = useState(imageUri);
    const [productName, setProductName] = useState(initialProductName || '');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [rotation, setRotation] = useState(0);

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const autoOrientImage = async (uri: string): Promise<string> => {
        try {
            console.log('Auto-orienting and normalizing image rotation...');
            const resized = await ImageResizer.createResizedImage(
                uri,
                1200,
                1200,
                'JPEG',
                90,
                0,
                null,
                false
            );
            return resized.uri;
        } catch (err) {
            console.warn('Failed to auto-orient image:', err);
            return uri;
        }
    };

    useEffect(() => {
        if (route.params?.imageUri) {
            const orientInitial = async () => {
                const oriented = await autoOrientImage(route.params.imageUri);
                setCurrentImageUri(oriented);
            };
            orientInitial();
        }
    }, [route.params?.imageUri]);

    useEffect(() => {
        if (!scanFailed) return;

        const backAction = () => {
            navigation.navigate('MainTabs');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [scanFailed, navigation]);

    const handleImageSelection = async (source: 'camera' | 'gallery') => {
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
                if (asset.uri) {
                    const oriented = await autoOrientImage(asset.uri);
                    setCurrentImageUri(oriented);
                    setRotation(0);
                    navigation.setParams({ imageUri: oriented, scanFailed: false });
                }
            }
        } catch (err) {
            console.error('Error selecting image:', err);
            Alert.alert('Error', 'Failed to process image selection');
        }
    };

    const handleReuploadPress = () => {
        Alert.alert(
            'Upload Ingredients Picture',
            'Choose an option to upload a clearer picture of the ingredients list.',
            [
                {
                    text: 'Take Photo',
                    onPress: () => handleImageSelection('camera'),
                },
                {
                    text: 'Choose from Gallery',
                    onPress: () => handleImageSelection('gallery'),
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleTextRecognition = async (uri: string) => {
        try {
            console.log('Processing image with Text Recognition:', uri);
            const result: any = await TextRecognition.recognize(uri);

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
                return extractedText
                    .replace(/\s+/g, ' ')
                    .replace(/\n+/g, ' ')
                    .trim();
            }
            return null;
        } catch (err) {
            console.error('Error during OCR text recognition:', err);
            throw err;
        }
    };

    const handleAnalyze = async () => {
        const cleanedName = productName.trim();
        if (!cleanedName) {
            setError('Product Name is required.');
            return;
        }
        setError('');

        if (user && user.points !== undefined && user.points < 5) {
            Alert.alert(
                'Insufficient Points',
                'You need at least 5 points to perform a scan. Please contribute to "Help Us Improve" to earn points!',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsProcessing(true);

        let processedUri = currentImageUri;
        try {
            if (rotation !== 0) {
                console.log(`Physically rotating image by manual input: ${rotation} degrees...`);
                const rotated = await ImageResizer.createResizedImage(
                    currentImageUri,
                    1200,
                    1200,
                    'JPEG',
                    90,
                    rotation,
                    null,
                    false
                );
                processedUri = rotated.uri;
                console.log('Rotated image path:', processedUri);
            }
        } catch (rotateError) {
            console.error('Failed to physically rotate image, using original:', rotateError);
        }

        try {
            // Start both upload and OCR concurrently
            const uploadPromise = uploadImageToBackend(processedUri, cleanedName);
            const ocrPromise = handleTextRecognition(processedUri);

            const [uploadedUrl, extractedText] = await Promise.all([
                uploadPromise,
                ocrPromise,
            ]);

            if (!extractedText) {
                Alert.alert(
                    'No Text Detected',
                    'Could not detect ingredients text in this photo. Please try again with a clearer image.',
                    [{ text: 'Try Again', onPress: () => navigation.goBack() }]
                );
                return;
            }

            const ingredients_hash = CryptoJS.SHA256(extractedText).toString(CryptoJS.enc.Hex);

            navigation.navigate('IngredientsResult', {
                ingredients: extractedText,
                ingredients_hash,
                productName: cleanedName,
                imageUri: currentImageUri,
                ingredientsImage: uploadedUrl || undefined,
            });
        } catch (err: any) {
            console.error('Error during image analysis:', err);
            Alert.alert('Analysis Failed', 'We encountered an issue analyzing the image. Please check your network connection and try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ScreenWrapper
            showHeader={true}
            headerTitle="Preview"
            onBackPress={() => {
                if (scanFailed) {
                    navigation.navigate('MainTabs');
                } else {
                    navigation.goBack();
                }
            }}
            scrollEnabled={true}
            backgroundColor={Theme.color.COLOR_BG}
            contentContainerStyle={styles.scrollContent}
            footerUnScrollable={() => (
                /* Footer Action Button */
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            Theme.shadows.sh_button,
                            (!productName.trim() || isProcessing) && styles.primaryButtonDisabled
                        ]}
                        onPress={handleAnalyze}
                        disabled={!productName.trim() || isProcessing}
                        activeOpacity={0.8}
                    >
                        {isProcessing ? (
                            <View style={styles.buttonContent}>
                                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 10 }} />
                                <SmallText textStyles={styles.primaryButtonText} size={3.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                                    Analyzing scan...
                                </SmallText>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Icon name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <SmallText textStyles={styles.primaryButtonText} size={3.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                                    Analyze Ingredients
                                </SmallText>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        >
            {/* Image Preview Card */}
            <View style={[styles.imageCard, Theme.shadows.sh_card]}>
                <Image
                    source={{ uri: currentImageUri }}
                    style={[styles.previewImage, { transform: [{ rotate: `${rotation}deg` }] }]}
                    resizeMode="contain"
                />
                <View style={styles.imageOverlay}>
                    <Icon name="scan" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <SmallText size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                        Ingredients Scan
                    </SmallText>
                </View>
            </View>

            {/* Visual Action Controls (Rotate and Reupload) */}
            <View style={styles.controlsRow}>
                <TouchableOpacity
                    style={[styles.controlButton, Theme.shadows.sh_card]}
                    onPress={handleRotate}
                    activeOpacity={0.7}
                >
                    <Icon name="refresh-outline" size={18} color={Theme.color.COLOR_PRIMARY_GREEN} />
                    <SmallText size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_PRIMARY_GREEN} textStyles={{ marginLeft: 6 }}>
                        Rotate Image
                    </SmallText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlButton, Theme.shadows.sh_card]}
                    onPress={handleReuploadPress}
                    activeOpacity={0.7}
                >
                    <Icon name="camera-outline" size={18} color={Theme.color.COLOR_PRIMARY_GREEN} />
                    <SmallText size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_PRIMARY_GREEN} textStyles={{ marginLeft: 6 }}>
                        Change Photo
                    </SmallText>
                </TouchableOpacity>
            </View>

            {/* Rotation / Scan Tip */}
            <View style={styles.tipContainer}>
                <Icon name="information-circle-outline" size={18} color="#D97706" style={{ marginRight: 6 }} />
                <SmallText size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color={Theme.color.COLOR_INK} numberOfLines={1} textStyles={{ flex: 1 }}>
                    Tip: If text is sideways or vertical, tap "Rotate Image" to align it.
                </SmallText>
            </View>

            {scanFailed && (
                <View style={styles.warningContainer}>
                    <Icon name="alert-circle" size={20} color={Theme.color.COLOR_HARAM} style={{ marginRight: 8 }} />
                    <SmallText size={3.1} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color={Theme.color.COLOR_HARAM} textStyles={{ flex: 1 }}>
                        No ingredients found in the previous scan. Please capture or upload a clearer picture of the ingredients list.
                    </SmallText>
                </View>
            )}

            {/* Inputs Card */}
            <View style={[styles.cardWrapper, Theme.shadows.sh_card]}>
                <SmallText size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_PRIMARY_GREEN} textStyles={{ letterSpacing: 0.5, marginBottom: height(1) }}>
                    PRODUCT VERIFICATION DETAILS
                </SmallText>
                <SmallText size={2.9} color={Theme.color.COLOR_MUTED} textStyles={{ marginBottom: height(2) }}>
                    Provide the product name to associate with this scan. This helps save the result in your scan history.
                </SmallText>

                <Input
                    label="Product Name"
                    placeholder="e.g. Lay's Salted Chips"
                    value={productName}
                    onChangeText={(text) => {
                        setProductName(text);
                        if (text.trim()) setError('');
                    }}
                    error={error}
                    mandatory={true}
                    containerStyle={{ marginHorizontal: 0 }}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        padding: width(5),
        paddingBottom: height(15),
    },
    imageCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: height(40),
        marginBottom: height(2.5),
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
    },
    previewImage: {
        height: '100%',
        width: '100%',
    },
    imageOverlay: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        borderRadius: 20,
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 6,
        position: 'absolute',
        right: 14,
        top: 14,
    },
    cardWrapper: {
        backgroundColor: '#FFFFFF',
        borderColor: '#ECEFF1',
        borderRadius: 20,
        borderWidth: 1,
        padding: width(4.5),
    },
    footer: {
        borderTopColor: Theme.color.COLOR_BORDER,
        borderTopWidth: 1,
        paddingHorizontal: width(5),
        paddingVertical: height(2),
        backgroundColor: Theme.color.COLOR_BG,
    },
    primaryButton: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 16,
        height: 52,
        justifyContent: 'center',
        width: '100%',
    },
    primaryButtonDisabled: {
        backgroundColor: '#ECEFF1',
    },
    buttonContent: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    primaryButtonText: {
        letterSpacing: 0.5,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_HARAM_BG,
        borderColor: Theme.color.COLOR_HARAM,
        borderWidth: 1,
        borderRadius: 16,
        padding: width(4),
        marginBottom: height(2.5),
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
        marginBottom: height(1.2),
    },
    controlButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderWidth: 1.5,
        borderRadius: 12,
        height: 40,
    },
    tipContainer: {
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 12,
        flexDirection: 'row',
        marginBottom: height(1),
        paddingHorizontal: width(3.5),
        paddingVertical: height(1.2),
    },
});

export default PreviewScan;
