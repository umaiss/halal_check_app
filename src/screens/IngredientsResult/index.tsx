import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import { useHalalCheckMutation, useImproveCheckMutation } from '../../redux/scanApi/scanApi';
import { HalalCheckResponse, IngredientStatus } from '../../redux/services/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { scanHistoryStorage } from '../../utils/scanHistoryStorage';
import { height, width } from '../../utils/dimensions';
import Input from '../../components/input';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToSupabase } from '../../utils/imageUpload';

type IngredientsResultRouteProp = RouteProp<RootStackParamList, 'IngredientsResult'>;
type IngredientsResultNavigationProp = NativeStackNavigationProp<RootStackParamList, 'IngredientsResult'>;

function IngredientsResult() {
    const navigation = useNavigation<IngredientsResultNavigationProp>();
    const route = useRoute<IngredientsResultRouteProp>();
    const { ingredients, imageUri, halalCheckResult, frontImage, backImage, ingredientsImage, productName } = route.params;

    // API hooks
    const [halalCheck, { data: halalCheckResultFromAPI, isLoading: isCheckingHalal, error: halalCheckError }] = useHalalCheckMutation();
    const [improveCheck] = useImproveCheckMutation();

    // State for halal check results
    const [halalStatus, setHalalStatus] = useState<HalalCheckResponse | null>(null);

    // State for improvement modal
    const [isImproveModalVisible, setIsImproveModalVisible] = useState(false);
    const [hasShownImproveModal, setHasShownImproveModal] = useState(false);
    const [barcodeImage, setBarcodeImage] = useState<string | null>(null);
    const [manufacturerImage, setManufacturerImage] = useState<string | null>(null);
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [isSubmittingImprovement, setIsSubmittingImprovement] = useState(false);

    // Helper function to get status color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return '#22C55E'; // Green
            case 'haram':
                return '#EF4444'; // Red
            case 'doubtful':
            case 'musbooh':
                return '#F59E0B'; // Yellow/Orange
            default:
                return Theme.color.COLOT_SUBTEXT;
        }
    };

    // Helper function to get status background color
    const getStatusBgColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return '#DCFCE7'; // Light green
            case 'haram':
                return '#FEE2E2'; // Light red
            case 'doubtful':
            case 'musbooh':
                return '#FEF3C7'; // Light yellow
            default:
                return '#F5F5F5';
        }
    };

    // Helper function to get status icon name
    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return 'checkmark-circle';
            case 'haram':
                return 'close-circle';
            case 'doubtful':
            case 'musbooh':
                return 'alert-circle';
            default:
                return 'help-circle';
        }
    };

    // Call halal check API when component mounts OR use pre-loaded result
    useEffect(() => {
        // If we have pre-loaded result from history, use it directly
        if (halalCheckResult) {
            console.log('Using pre-loaded halal check result from history');
            setHalalStatus(halalCheckResult);
        } else if (ingredients && ingredients.trim().length > 0) {
            // Otherwise, perform new API call
            handleHalalCheck();
        }
    }, []);

    // Format data for API request
    const formatDataForAPI = (text: string, hash: string, front?: string, back?: string, ingredientsImg?: string) => {
        // Clean the text
        const cleanedText = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, ' ') // Replace newlines with space
            .trim(); // Remove leading/trailing whitespace

        // Prepare data in a format suitable for API
        const apiData = {
            text: cleanedText,
            ingredients_hash: hash,
            front_image: front,
            back_image: back,
            ingredients_image: ingredientsImg,
            product_name: productName,
        };

        return apiData;
    };

    // Handle halal check API call
    const handleHalalCheck = async () => {
        try {
            // Format the data before sending
            const formattedData = formatDataForAPI(ingredients, route.params.ingredients_hash, frontImage, backImage, ingredientsImage);

            console.log('Sending data to API:', JSON.stringify(formattedData, null, 2));

            // Send formatted data to API
            const result = await halalCheck(formattedData).unwrap();

            console.log('Halal check API response:', result);
            setHalalStatus(result);

            // Save to AsyncStorage scan history (only for new scans, not from history)
            try {
                await scanHistoryStorage.addScan({
                    ingredients,
                    productName,
                    imageUri,
                    halalCheckResult: result,
                });
                console.log('Scan saved to history');
            } catch (storageError) {
                console.error('Failed to save scan to history:', storageError);
                // Don't show error to user, just log it
            }
        } catch (error: any) {
            console.error('Error checking halal status:', error.message);
            setHalalStatus(null);
        }
    };

    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        const isMushbooh = halalStatus?.overall_status?.toLowerCase() === 'musbooh' || 
                          halalStatus?.overall_status?.toLowerCase() === 'mushbooh' || 
                          halalStatus?.overall_status?.toLowerCase() === 'doubtful';

        if (scrollY > 50 && isMushbooh && !hasShownImproveModal && !isCheckingHalal) {
            setIsImproveModalVisible(true);
            setHasShownImproveModal(true);
        }
    };

    const handleCaptureImage = async (type: 'barcode' | 'manufacturer' | 'additional') => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                selectionLimit: type === 'additional' ? 3 - additionalImages.length : 1,
            });

            if (result.assets && result.assets.length > 0) {
                const uris = result.assets.map(asset => asset.uri).filter((uri): uri is string => !!uri);
                
                if (type === 'barcode') setBarcodeImage(uris[0]);
                else if (type === 'manufacturer') setManufacturerImage(uris[0]);
                else setAdditionalImages([...additionalImages, ...uris]);
            }
        } catch (err) {
            console.error('Error picking images:', err);
        }
    };

    const handleSubmitImprovement = async () => {
        if (!halalStatus?.id) {
            Alert.alert('Error', 'Unable to find product ID to attach feedback.');
            return;
        }

        setIsSubmittingImprovement(true);
        try {
            const improvementData: any = {};

            // 1. Upload barcode image if exists
            if (barcodeImage) {
                const url = await uploadImageToSupabase(barcodeImage, 'improvement-images');
                if (url) improvementData.barcode_image = url;
            }

            // 2. Upload manufacturer image if exists
            if (manufacturerImage) {
                const url = await uploadImageToSupabase(manufacturerImage, 'improvement-images');
                if (url) improvementData.manufacturer_image = url;
            }

            // 3. Upload additional images if exist
            if (additionalImages.length > 0) {
                const uploadPromises = additionalImages.map((uri) => 
                    uploadImageToSupabase(uri, 'improvement-images')
                );
                const urls = await Promise.all(uploadPromises);
                improvementData.additional_images = urls.filter((url): url is string => !!url);
            }

            // 4. Send to backend
            await improveCheck({
                id: halalStatus.id,
                data: improvementData
            }).unwrap();

            setIsImproveModalVisible(false);
            Alert.alert('Thank You!', 'Your images have been submitted successfully to improve our analysis.');
        } catch (error: any) {
            console.error('Error submitting improvement:', error);
            Alert.alert('Error', 'Failed to upload improvement data. Please try again.');
        } finally {
            setIsSubmittingImprovement(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={24} color={Theme.color.COLOR_TEXT} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <SmallText textStyles={styles.headerTitle} size={4.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                        Verification Results
                    </SmallText>
                </View>
                <View style={styles.backButton} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Product Images Section */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesCarousel}
                    contentContainerStyle={styles.imagesCarouselContent}
                >
                    {frontImage && (
                        <View style={styles.imageCard}>
                            <Image source={{ uri: frontImage }} style={styles.capturedImage} resizeMode="cover" />
                            <View style={styles.imageOverlay}>
                                <Icon name="camera" size={16} color={Theme.color.COLOR_WHITE} />
                                <SmallText textStyles={styles.imageLabel} size={2.2}>Front View</SmallText>
                            </View>
                        </View>
                    )}
                    {backImage && (
                        <View style={styles.imageCard}>
                            <Image source={{ uri: backImage }} style={styles.capturedImage} resizeMode="cover" />
                            <View style={styles.imageOverlay}>
                                <Icon name="camera" size={16} color={Theme.color.COLOR_WHITE} />
                                <SmallText textStyles={styles.imageLabel} size={2.2}>Back View</SmallText>
                            </View>
                        </View>
                    )}
                    {ingredientsImage && (
                        <View style={styles.imageCard}>
                            <Image source={{ uri: ingredientsImage }} style={styles.capturedImage} resizeMode="cover" />
                            <View style={styles.imageOverlay}>
                                <Icon name="camera" size={16} color={Theme.color.COLOR_WHITE} />
                                <SmallText textStyles={styles.imageLabel} size={2.2}>Ingredients</SmallText>
                            </View>
                        </View>
                    )}
                    {!frontImage && !backImage && !ingredientsImage && imageUri && (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: imageUri }} style={styles.capturedImage} resizeMode="cover" />
                            <View style={styles.imageOverlay}>
                                <Icon name="camera" size={20} color={Theme.color.COLOR_WHITE} />
                                <SmallText textStyles={styles.imageLabel} size={2.5}>Scanned Image</SmallText>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Halal Check Status Section */}
                <View style={styles.halalCheckContainer}>
                    {isCheckingHalal ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Theme.color.COLOR_BLUE} />
                            <SmallText textStyles={styles.loadingText} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                                Analyzing ingredients...
                            </SmallText>
                            <SmallText textStyles={styles.loadingSubtext} size={2.5}>
                                This may take a few seconds
                            </SmallText>
                        </View>
                    ) : halalCheckError ? (
                        <View style={styles.errorContainer}>
                            <Icon name="alert-circle" size={48} color={Theme.color.COLOR_RED} />
                            <SmallText textStyles={styles.errorTitle} size={4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                Verification Failed
                            </SmallText>
                            <SmallText textStyles={styles.errorText} size={3}>
                                Unable to verify ingredients. Please check your connection and try again.
                            </SmallText>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={handleHalalCheck}
                                activeOpacity={0.8}
                            >
                                <Icon name="refresh" size={18} color={Theme.color.COLOR_WHITE} style={styles.retryIcon} />
                                <SmallText textStyles={styles.retryButtonText} size={3} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Retry Verification
                                </SmallText>
                            </TouchableOpacity>
                        </View>
                    ) : halalStatus ? (
                        <>
                            {/* Enhanced Overall Product Status Card */}
                            {halalStatus?.overall_status && (
                                <View style={[
                                    styles.overallStatusCard,
                                    {
                                        backgroundColor: getStatusBgColor(halalStatus.overall_status),
                                        borderColor: getStatusColor(halalStatus.overall_status),
                                    }
                                ]}>
                                    <View style={styles.overallStatusHeader}>
                                        <View style={[
                                            styles.statusIconContainer,
                                            { backgroundColor: getStatusColor(halalStatus.overall_status) }
                                        ]}>
                                            <Icon
                                                name={getStatusIcon(halalStatus.overall_status)}
                                                size={32}
                                                color={Theme.color.COLOR_WHITE}
                                            />
                                        </View>
                                        <View style={styles.overallStatusTextContainer}>
                                            <SmallText textStyles={styles.overallStatusLabel} size={2.5}>
                                                Overall Product Status
                                            </SmallText>
                                            <SmallText
                                                textStyles={{
                                                    ...styles.overallStatusText,
                                                    color: getStatusColor(halalStatus.overall_status)
                                                }}
                                                size={5}
                                                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                            >
                                                {halalStatus.overall_status.toUpperCase()}
                                            </SmallText>
                                        </View>
                                    </View>
                                    {halalStatus.reasoning && (
                                        <View style={styles.reasoningContainer}>
                                            <Icon name="information-circle" size={18} color={getStatusColor(halalStatus.overall_status)} />
                                            <SmallText textStyles={styles.reasoningText} size={3}>
                                                {halalStatus.reasoning}
                                            </SmallText>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Enhanced Ingredients Analysis List */}
                            {halalStatus.ingredients_analysis && halalStatus.ingredients_analysis.length > 0 && (
                                <View style={styles.ingredientsStatusContainer}>
                                    <View style={styles.sectionHeader}>
                                        <Icon name="list" size={22} color={Theme.color.COLOR_TEXT} />
                                        <SmallText
                                            textStyles={styles.ingredientsStatusTitle}
                                            size={4}
                                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                        >
                                            Ingredient Analysis
                                        </SmallText>
                                        <View style={styles.badge}>
                                            <SmallText textStyles={styles.badgeText} size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                {halalStatus.ingredients_analysis.length}
                                            </SmallText>
                                        </View>
                                    </View>
                                    {halalStatus.ingredients_analysis.map((item: any, index: number) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.ingredientStatusCard,
                                                { borderLeftColor: getStatusColor(item.status) }
                                            ]}
                                        >
                                            <View style={styles.ingredientStatusHeader}>
                                                <View style={[
                                                    styles.ingredientStatusBadge,
                                                    { backgroundColor: getStatusBgColor(item.status) }
                                                ]}>
                                                    <Icon
                                                        name={getStatusIcon(item.status)}
                                                        size={16}
                                                        color={getStatusColor(item.status)}
                                                    />
                                                    <SmallText
                                                        textStyles={{
                                                            ...styles.ingredientStatusBadgeText,
                                                            color: getStatusColor(item.status)
                                                        }}
                                                        size={2.5}
                                                        fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                                    >
                                                        {item.status?.toUpperCase()}
                                                    </SmallText>
                                                </View>
                                                <SmallText
                                                    textStyles={styles.ingredientStatusName}
                                                    size={3.5}
                                                    fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                                >
                                                    {item.component_name}
                                                </SmallText>
                                            </View>
                                            {item.note && (
                                                <View style={styles.noteContainer}>
                                                    <Icon name="document-text" size={16} color={Theme.color.COLOT_SUBTEXT} />
                                                    <SmallText textStyles={styles.ingredientReasonText} size={3}>
                                                        {item.note}
                                                    </SmallText>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </>
                    ) : null}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Icon name="camera" size={20} color={Theme.color.COLOR_WHITE} style={styles.buttonIcon} />
                        <SmallText textStyles={styles.primaryButtonText} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                            Scan Again
                        </SmallText>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Improvement Modal */}
            <Modal
                visible={isImproveModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsImproveModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Icon name="help-buoy" size={30} color={Theme.color.COLOR_BLUE} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <SmallText textStyles={styles.modalTitle} size={4.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Help Us Improve!
                                </SmallText>
                                <SmallText textStyles={styles.modalSubTitle} size={2.8}>
                                    Analysis for this product is doubtful.
                                </SmallText>
                            </View>
                            <TouchableOpacity onPress={() => setIsImproveModalVisible(false)}>
                                <Icon name="close" size={24} color={Theme.color.COLOT_SUBTEXT} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height(60) }}>
                            <SmallText textStyles={styles.modalDescription} size={3}>
                                Take clear photos of the product details to help our AI provide more accurate results.
                            </SmallText>

                            <View style={styles.specificImageSection}>
                                <TouchableOpacity 
                                    style={[styles.specificImageRow, barcodeImage && styles.specificImageRowActive]} 
                                    onPress={() => handleCaptureImage('barcode')}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flex: 1 }}>
                                        <SmallText textStyles={styles.fieldLabel} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_BOLD}>
                                            Barcode Image
                                        </SmallText>
                                        <SmallText textStyles={styles.fieldSubLabel} size={2.5}>
                                            Capture the product barcode clearly
                                        </SmallText>
                                    </View>
                                    <View style={[styles.captureButton, barcodeImage && styles.captureButtonActive]}>
                                        {barcodeImage ? (
                                            <Image source={{ uri: barcodeImage }} style={styles.previewThumbnail} />
                                        ) : (
                                            <Icon name="barcode" size={24} color={Theme.color.COLOR_BLUE} />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.specificImageRow, manufacturerImage && styles.specificImageRowActive]} 
                                    onPress={() => handleCaptureImage('manufacturer')}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flex: 1 }}>
                                        <SmallText textStyles={styles.fieldLabel} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_BOLD}>
                                            Manufacturer Info
                                        </SmallText>
                                        <SmallText textStyles={styles.fieldSubLabel} size={2.5}>
                                            Photo of the brand/company details
                                        </SmallText>
                                    </View>
                                    <View style={[styles.captureButton, manufacturerImage && styles.captureButtonActive]}>
                                        {manufacturerImage ? (
                                            <Image source={{ uri: manufacturerImage }} style={styles.previewThumbnail} />
                                        ) : (
                                            <Icon name="business" size={24} color={Theme.color.COLOR_BLUE} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.additionalImagesSection}>
                                <SmallText textStyles={styles.fieldLabel} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_BOLD}>
                                    Other Product Images
                                </SmallText>
                                <View style={styles.additionalImagesGrid}>
                                    {additionalImages.map((uri, index) => (
                                        <View key={index} style={styles.additionalImageWrapper}>
                                            <Image source={{ uri }} style={styles.additionalImage} />
                                            <TouchableOpacity 
                                                style={styles.removeImageButton}
                                                onPress={() => setAdditionalImages(additionalImages.filter((_, i) => i !== index))}
                                            >
                                                <Icon name="close-circle" size={20} color={Theme.color.COLOR_RED} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {additionalImages.length < 3 && (
                                        <TouchableOpacity style={styles.addImageButton} onPress={() => handleCaptureImage('additional')}>
                                            <Icon name="add" size={30} color={Theme.color.COLOT_SUBTEXT} />
                                            <SmallText size={2}>Add Photo</SmallText>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={[styles.modalSubmitButton, isSubmittingImprovement && { opacity: 0.7 }]}
                                onPress={handleSubmitImprovement}
                                disabled={isSubmittingImprovement}
                            >
                                {isSubmittingImprovement ? (
                                    <ActivityIndicator color={Theme.color.COLOR_WHITE} />
                                ) : (
                                    <SmallText textStyles={styles.modalSubmitText} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                        Submit Feedback
                                    </SmallText>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsImproveModalVisible(false)}>
                                <SmallText textStyles={styles.modalCloseText} size={3}>Maybe Later</SmallText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width(5.3),
        paddingTop: height(1.2),
        paddingBottom: height(2),
        backgroundColor: Theme.color.COLOR_WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    backButton: {
        width: width(10.6),
        height: width(10.6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: Theme.color.COLOR_TEXT,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: width(5.3),
        paddingBottom: height(5),
    },
    imageContainer: {
        width: width(89.4),
        height: height(27),
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: height(3),
        backgroundColor: '#F5F5F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    imagesCarousel: {
        marginBottom: height(3),
    },
    imagesCarouselContent: {
        paddingRight: width(5.3),
    },
    imageCard: {
        width: width(74.6),
        height: height(27),
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: width(4.2),
        backgroundColor: '#F5F5F5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    capturedImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width(3.2),
        paddingVertical: height(1),
    },
    imageLabel: {
        color: Theme.color.COLOR_WHITE,
        marginLeft: 6,
    },
    halalCheckContainer: {
        marginBottom: height(3),
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: width(10.6),
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    loadingText: {
        marginTop: height(2),
        color: Theme.color.COLOR_TEXT,
    },
    loadingSubtext: {
        marginTop: height(1),
        color: Theme.color.COLOT_SUBTEXT,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: width(8.5),
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    errorTitle: {
        color: Theme.color.COLOR_RED,
        marginTop: height(2),
        marginBottom: height(1),
        textAlign: 'center',
    },
    errorText: {
        color: Theme.color.COLOT_SUBTEXT,
        textAlign: 'center',
        marginBottom: height(3),
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        borderRadius: 12,
        paddingVertical: height(1.5),
        paddingHorizontal: width(6.4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    retryIcon: {
        marginRight: 8,
    },
    retryButtonText: {
        color: Theme.color.COLOR_WHITE,
    },
    sectionTitle: {
        color: Theme.color.COLOR_TEXT,
        marginBottom: height(2),
    },
    overallStatusCard: {
        borderRadius: 20,
        padding: width(6.4),
        marginBottom: height(3),
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    overallStatusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height(2),
    },
    statusIconContainer: {
        width: width(17),
        height: width(17),
        borderRadius: width(8.5),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width(4.2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    overallStatusTextContainer: {
        flex: 1,
    },
    overallStatusLabel: {
        color: Theme.color.COLOT_SUBTEXT,
        marginBottom: 6,
    },
    overallStatusText: {
        fontSize: width(7.4),
        lineHeight: width(9.6),
    },
    reasoningContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: height(2),
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    reasoningText: {
        color: Theme.color.COLOR_TEXT,
        lineHeight: 22,
        marginLeft: 8,
        flex: 1,
    },
    ingredientsStatusContainer: {
        marginTop: height(1),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height(2),
    },
    ingredientsStatusTitle: {
        color: Theme.color.COLOR_TEXT,
        marginLeft: 8,
        flex: 1,
    },
    badge: {
        backgroundColor: Theme.color.COLOR_BLUE,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        color: Theme.color.COLOR_WHITE,
    },
    ingredientStatusCard: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        padding: width(4.8),
        marginBottom: height(1.5),
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    ingredientStatusHeader: {
        marginBottom: height(1.5),
    },
    ingredientNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    ingredientStatusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
        marginBottom: 8,
    },
    ingredientStatusBadgeText: {
        fontSize: 11,
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    ingredientStatusName: {
        color: Theme.color.COLOR_TEXT,
        flex: 1,
        lineHeight: 24,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: height(1.5),
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    ingredientReasonText: {
        color: Theme.color.COLOT_SUBTEXT,
        lineHeight: 20,
        marginLeft: 8,
        flex: 1,
    },
    actionsContainer: {
        marginTop: height(3),
        marginBottom: height(2.5),
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        borderRadius: 16,
        paddingVertical: height(2.2),
        paddingHorizontal: width(8.5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonIcon: {
        marginRight: 8,
    },
    primaryButtonText: {
        color: Theme.color.COLOR_WHITE,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: width(6.4),
        paddingBottom: Platform.OS === 'ios' ? height(5) : height(3),
        maxHeight: height(85),
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height(2.5),
    },
    modalIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#EBF5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    modalTitle: {
        color: Theme.color.COLOR_TEXT,
        marginBottom: 2,
    },
    modalSubTitle: {
        color: Theme.color.COLOR_BLUE,
        fontFamily: Theme.fonts.FONT_NUNITO_BOLD,
    },
    modalDescription: {
        color: Theme.color.COLOT_SUBTEXT,
        lineHeight: 18,
        marginBottom: height(2.5),
    },
    specificImageSection: {
        marginBottom: height(2),
    },
    specificImageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    specificImageRowActive: {
        borderColor: '#DBEAFE',
        backgroundColor: '#F0F9FF',
    },
    fieldLabel: {
        color: Theme.color.COLOR_TEXT,
        marginBottom: 2,
    },
    fieldSubLabel: {
        color: Theme.color.COLOT_SUBTEXT,
    },
    captureButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    captureButtonActive: {
        padding: 0,
        overflow: 'hidden',
    },
    previewThumbnail: {
        width: '100%',
        height: '100%',
    },
    additionalImagesSection: {
        marginTop: height(1),
        marginBottom: height(2),
    },
    additionalImagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: width(3),
    },
    additionalImageWrapper: {
        width: width(25),
        height: width(25),
        borderRadius: 12,
        position: 'relative',
    },
    additionalImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    removeImageButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 10,
    },
    addImageButton: {
        width: width(25),
        height: width(25),
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    modalFooter: {
        marginTop: height(2),
    },
    modalSubmitButton: {
        backgroundColor: Theme.color.COLOR_BLUE,
        borderRadius: 16,
        paddingVertical: height(2),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modalSubmitText: {
        color: Theme.color.COLOR_WHITE,
    },
    modalCloseButton: {
        paddingVertical: height(1.5),
        alignItems: 'center',
        marginTop: height(1),
    },
    modalCloseText: {
        color: Theme.color.COLOT_SUBTEXT,
        textDecorationLine: 'underline',
    },
});

export default IngredientsResult;
