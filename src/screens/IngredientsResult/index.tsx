import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Alert, Platform, Share } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { SmallText } from '../../components/text';
import ScreenWrapper from '../../components/screen-wrapper';
import Theme from '../../theme/theme';
import { useHalalCheckMutation, useImproveCheckMutation } from '../../redux/scanApi/scanApi';
import { HalalCheckResponse } from '../../redux/services/types';
import { scanHistoryStorage } from '../../utils/scanHistoryStorage';
import { height, width } from '../../utils/dimensions';
import { uploadImageToBackend } from '../../utils/imageUpload';

type IngredientsResultRouteProp = RouteProp<RootStackParamList, 'IngredientsResult'>;
type IngredientsResultNavigationProp = NativeStackNavigationProp<RootStackParamList, 'IngredientsResult'>;

function IngredientsResult() {
    const navigation = useNavigation<IngredientsResultNavigationProp>();
    const route = useRoute<IngredientsResultRouteProp>();
    const { ingredients, imageUri, halalCheckResult, frontImage, backImage, ingredientsImage, productName } = route.params;

    const imageCount = [frontImage, backImage, ingredientsImage].filter(Boolean).length || (imageUri ? 1 : 0);
    const isSingleImage = imageCount === 1;

    // API hooks
    const [halalCheck, { data: halalCheckResultFromAPI, isLoading: isCheckingHalal, error: halalCheckError }] = useHalalCheckMutation();
    const [improveCheck] = useImproveCheckMutation();

    // State for halal check results
    const [halalStatus, setHalalStatus] = useState<HalalCheckResponse | null>(null);

    // Accordion / interactive states
    const [reasonOpen, setReasonOpen] = useState(false);
    const [expandedIngredients, setExpandedIngredients] = useState<number[]>([]);

    // State for improvement modal
    const [isImproveModalVisible, setIsImproveModalVisible] = useState(false);
    const [hasShownImproveModal, setHasShownImproveModal] = useState(false);
    const [frontImageImprove, setFrontImageImprove] = useState<string | null>(null);
    const [backImageImprove, setBackImageImprove] = useState<string | null>(null);
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [isSubmittingImprovement, setIsSubmittingImprovement] = useState(false);

    // Helper function to get status color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return Theme.color.COLOR_HALAL;
            case 'haram':
                return Theme.color.COLOR_HARAM;
            case 'doubtful':
            case 'doubt':
            case 'musbooh':
            case 'mushbooh':
                return Theme.color.COLOR_DOUBTFUL;
            default:
                return Theme.color.COLOR_MUTED;
        }
    };

    // Helper function to get status background color
    const getStatusBgColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return Theme.color.COLOR_HALAL_BG;
            case 'haram':
                return Theme.color.COLOR_HARAM_BG;
            case 'doubtful':
            case 'doubt':
            case 'musbooh':
            case 'mushbooh':
                return Theme.color.COLOR_DOUBTFUL_BG;
            default:
                return Theme.color.COLOR_BG;
        }
    };

    // Helper function to get status shadow config
    const getStatusShadow = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return Theme.shadows.sh_glow_halal;
            case 'haram':
                return Theme.shadows.sh_glow_haram;
            case 'doubtful':
            case 'doubt':
            case 'musbooh':
            case 'mushbooh':
                return Theme.shadows.sh_glow_doubtful;
            default:
                return Theme.shadows.sh_card;
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
            case 'doubt':
            case 'musbooh':
            case 'mushbooh':
                return 'alert-circle';
            default:
                return 'help-circle';
        }
    };

    // Helper function to get status summary text
    const getStatusTextLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return 'Halal Certified / Permitted';
            case 'haram':
                return 'Haram / Avoid Product';
            case 'doubtful':
            case 'doubt':
            case 'musbooh':
            case 'mushbooh':
                return 'Doubtful Ingredients Found';
            default:
                return 'Unknown Verification Status';
        }
    };

    // Format data for API request
    const formatDataForAPI = React.useCallback((text: string, hash: string, front?: string, back?: string, ingredientsImg?: string) => {
        const cleanedText = text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, ' ')
            .trim();

        return {
            text: cleanedText,
            ingredients_hash: hash,
            front_image: front,
            back_image: back,
            ingredients_image: ingredientsImg,
            product_name: productName,
        };
    }, [productName]);

    // Handle halal check API call
    const handleHalalCheck = React.useCallback(async () => {
        try {
            const formattedData = formatDataForAPI(ingredients, route.params.ingredients_hash, frontImage, backImage, ingredientsImage);
            console.log('Sending data to API:', JSON.stringify(formattedData, null, 2));

            const result = await halalCheck(formattedData).unwrap();
            console.log('Halal check API response:', result);

            if (result.ingredients_found === false) {
                Alert.alert(
                    'No Ingredients Found',
                    'We could not find any ingredients in this scan. Please make sure you are scanning a clear ingredients list.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                navigation.navigate('PreviewScan', {
                                    imageUri: imageUri || '',
                                    productName,
                                    scanFailed: true,
                                });
                            }
                        }
                    ]
                );
                return;
            }

            setHalalStatus(result);

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
            }
        } catch (error: any) {
            console.error('Error checking halal status:', error);
            setHalalStatus(null);
            const errorMsg = error?.data?.error || error?.data?.message || error?.message || 'An error occurred during the Halal analysis.';
            Alert.alert('Analysis Failed', errorMsg);
        }
    }, [formatDataForAPI, ingredients, route.params.ingredients_hash, frontImage, backImage, ingredientsImage, halalCheck, productName, imageUri, navigation]);

    // Call halal check API when component mounts OR use pre-loaded result
    useEffect(() => {
        if (halalCheckResult) {
            console.log('Using pre-loaded halal check result from history');
            setHalalStatus(halalCheckResult);
        } else if (ingredients && ingredients.trim().length > 0) {
            handleHalalCheck();
        }
    }, [halalCheckResult, ingredients, handleHalalCheck]);

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        const isMushbooh = halalStatus?.overall_status?.toLowerCase() === 'musbooh' ||
            halalStatus?.overall_status?.toLowerCase() === 'mushbooh' ||
            halalStatus?.overall_status?.toLowerCase() === 'doubtful' ||
            halalStatus?.overall_status?.toLowerCase() === 'doubt';

        if (isEnd && isMushbooh && !hasShownImproveModal && !isCheckingHalal) {
            setIsImproveModalVisible(true);
            setHasShownImproveModal(true);
        }
    };

    const handleCaptureImage = async (type: 'additional' | 'front' | 'back') => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.6,
                maxWidth: 1080,
                maxHeight: 1080,
                selectionLimit: type === 'additional' ? 3 - additionalImages.length : 1,
            });

            if (result.didCancel) return;

            if (result.assets && result.assets.length > 0) {
                const uris = result.assets.map(asset => asset.uri).filter((uri): uri is string => !!uri);

                if (type === 'front') setFrontImageImprove(uris[0]);
                else if (type === 'back') setBackImageImprove(uris[0]);
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
            const uploadPromises: Promise<void>[] = [];

            if (frontImageImprove) {
                uploadPromises.push(
                    uploadImageToBackend(frontImageImprove, productName)
                        .then(url => { if (url) improvementData.front_image = url; })
                );
            }

            if (backImageImprove) {
                uploadPromises.push(
                    uploadImageToBackend(backImageImprove, productName)
                        .then(url => { if (url) improvementData.back_image = url; })
                );
            }

            if (additionalImages.length > 0) {
                const additionalPromises = additionalImages.map((uri) =>
                    uploadImageToBackend(uri, productName)
                );
                uploadPromises.push(
                    Promise.all(additionalPromises)
                        .then(urls => {
                            improvementData.additional_images = urls.filter((url): url is string => !!url);
                        })
                );
            }

            await Promise.all(uploadPromises);

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

    const handleShare = async () => {
        try {
            if (!halalStatus) return;
            const statusStr = halalStatus.overall_status?.toUpperCase() || 'UNKNOWN';
            const prodName = productName || 'Product';

            await Share.share({
                message: `Halal Check Verification Results:\nProduct: ${prodName}\nOverall Status: ${statusStr}\n\nChecked with Halal Check AI app.`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const toggleIngredient = (idx: number) => {
        if (expandedIngredients.includes(idx)) {
            setExpandedIngredients(expandedIngredients.filter(i => i !== idx));
        } else {
            setExpandedIngredients([...expandedIngredients, idx]);
        }
    };

    // Calculate Tally metrics
    const ingredientsAnalysis = halalStatus?.ingredients_analysis || [];
    const tally = { halal: 0, doubtful: 0, haram: 0 };
    ingredientsAnalysis.forEach((item: any) => {
        const s = item.status?.toLowerCase();
        if (s === 'halal') {
            tally.halal++;
        } else if (s === 'haram') {
            tally.haram++;
        } else if (s === 'doubtful' || s === 'musbooh' || s === 'mushbooh' || s === 'doubt') {
            tally.doubtful++;
        }
    });

    return (
        <View style={styles.container}>
            <ScreenWrapper
                showHeader={true}
                headerTitle="Verification Results"
                onBackPress={() => navigation.goBack()}
                rightIcon={halalStatus ? <Icon name="share-social-outline" size={22} color={Theme.color.COLOR_TEXT} /> : undefined}
                onRightIconPress={halalStatus ? handleShare : undefined}
                scrollEnabled={true}
                backgroundColor={Theme.color.COLOR_BG}
                contentContainerStyle={styles.contentContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Horizontal Product Images Carousel */}
                {(frontImage || backImage || ingredientsImage || imageUri) && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.imagesCarousel}
                        contentContainerStyle={styles.imagesCarouselContent}
                    >
                        {frontImage && (
                            <View style={[styles.imageCard, isSingleImage && { width: width(91) }, Theme.shadows.sh_card]}>
                                <Image source={{ uri: frontImage }} style={styles.capturedImage} resizeMode="cover" />
                                <View style={styles.imageOverlay}>
                                    <Icon name="camera" size={14} color={Theme.color.COLOR_WHITE} />
                                    <SmallText textStyles={styles.imageLabel} size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>Front View</SmallText>
                                </View>
                            </View>
                        )}
                        {backImage && (
                            <View style={[styles.imageCard, isSingleImage && { width: width(91) }, Theme.shadows.sh_card]}>
                                <Image source={{ uri: backImage }} style={styles.capturedImage} resizeMode="cover" />
                                <View style={styles.imageOverlay}>
                                    <Icon name="camera" size={14} color={Theme.color.COLOR_WHITE} />
                                    <SmallText textStyles={styles.imageLabel} size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>Back View</SmallText>
                                </View>
                            </View>
                        )}
                        {ingredientsImage && (
                            <View style={[styles.imageCard, isSingleImage && { width: width(91) }, Theme.shadows.sh_card]}>
                                <Image source={{ uri: ingredientsImage }} style={styles.capturedImage} resizeMode="cover" />
                                <View style={styles.imageOverlay}>
                                    <Icon name="camera" size={14} color={Theme.color.COLOR_WHITE} />
                                    <SmallText textStyles={styles.imageLabel} size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>Ingredients</SmallText>
                                </View>
                            </View>
                        )}
                        {!frontImage && !backImage && !ingredientsImage && imageUri && (
                            <View style={[styles.imageCard, isSingleImage && { width: width(91) }, Theme.shadows.sh_card]}>
                                <Image source={{ uri: imageUri }} style={styles.capturedImage} resizeMode="cover" />
                                <View style={styles.imageOverlay}>
                                    <Icon name="camera" size={14} color={Theme.color.COLOR_WHITE} />
                                    <SmallText textStyles={styles.imageLabel} size={2.5} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>Scanned Image</SmallText>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}

                {/* Halal Check Status Section */}
                <View style={styles.halalCheckContainer}>
                    {isCheckingHalal ? (
                        <View style={[styles.loadingContainer, Theme.shadows.sh_card]}>
                            <ActivityIndicator size="large" color={Theme.color.COLOR_PRIMARY_GREEN} />
                            <SmallText textStyles={styles.loadingText} size={3.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                Analyzing ingredients...
                            </SmallText>
                            <SmallText textStyles={styles.loadingSubtext} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                                This may take a few seconds
                            </SmallText>
                        </View>
                    ) : halalCheckError ? (
                        <View style={[styles.errorContainer, Theme.shadows.sh_card]}>
                            <Icon name="alert-circle" size={48} color={Theme.color.COLOR_HARAM} />
                            <SmallText textStyles={styles.errorTitle} size={4.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                Verification Failed
                            </SmallText>
                            <SmallText textStyles={styles.errorText} size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                                Unable to verify ingredients. Please check your connection and try again.
                            </SmallText>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={handleHalalCheck}
                                activeOpacity={0.8}
                            >
                                <Icon name="refresh" size={18} color={Theme.color.COLOR_WHITE} style={styles.retryIcon} />
                                <SmallText textStyles={styles.retryButtonText} size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Retry Verification
                                </SmallText>
                            </TouchableOpacity>
                        </View>
                    ) : halalStatus ? (
                        <>
                            {/* Product Name Header */}
                            {productName ? (
                                <View style={styles.productNameContainer}>
                                    <SmallText textStyles={styles.productNameLabel} size={2.6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>PRODUCT NAME</SmallText>
                                    <SmallText textStyles={styles.productNameText} size={4.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>{productName}</SmallText>
                                </View>
                            ) : null}

                            {/* Overall Product Status Hero Card */}
                            {halalStatus?.overall_status && (
                                <View style={[
                                    styles.overallStatusCard,
                                    getStatusShadow(halalStatus.overall_status),
                                    {
                                        backgroundColor: getStatusBgColor(halalStatus.overall_status),
                                        borderColor: getStatusColor(halalStatus.overall_status),
                                    }
                                ]}>
                                    <View style={styles.overallStatusHeader}>
                                        <View style={[
                                            styles.statusIconContainer,
                                            { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: getStatusColor(halalStatus.overall_status), borderWidth: 1 }
                                        ]}>
                                            <Icon
                                                name={getStatusIcon(halalStatus.overall_status)}
                                                size={32}
                                                color={getStatusColor(halalStatus.overall_status)}
                                            />
                                        </View>
                                        <View style={styles.overallStatusTextContainer}>
                                            <SmallText textStyles={styles.overallStatusLabel} size={2.6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                VERDICT
                                            </SmallText>
                                            <SmallText
                                                textStyles={{
                                                    ...styles.overallStatusText,
                                                    color: getStatusColor(halalStatus.overall_status)
                                                }}
                                                size={6.2}
                                                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                            >
                                                {halalStatus.overall_status.toUpperCase()}
                                            </SmallText>
                                            <SmallText textStyles={styles.overallStatusLabelText} size={3} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                                                {getStatusTextLabel(halalStatus.overall_status)}
                                            </SmallText>
                                        </View>
                                    </View>

                                    {/* Tally Row */}
                                    <View style={styles.tallyDivider} />
                                    <View style={styles.tallyRow}>
                                        <View style={styles.tallyColumn}>
                                            <SmallText textStyles={{ ...styles.tallyCount, color: Theme.color.COLOR_HALAL }} size={6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                {tally.halal}
                                            </SmallText>
                                            <SmallText textStyles={styles.tallyLabel} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                                                Halal
                                            </SmallText>
                                        </View>
                                        <View style={styles.tallyColumn}>
                                            <SmallText textStyles={{ ...styles.tallyCount, color: Theme.color.COLOR_DOUBTFUL }} size={6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                {tally.doubtful}
                                            </SmallText>
                                            <SmallText textStyles={styles.tallyLabel} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                                                Doubtful
                                            </SmallText>
                                        </View>
                                        <View style={styles.tallyColumn}>
                                            <SmallText textStyles={{ ...styles.tallyCount, color: Theme.color.COLOR_HARAM }} size={6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                {tally.haram}
                                            </SmallText>
                                            <SmallText textStyles={styles.tallyLabel} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                                                Haram
                                            </SmallText>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Help Us Improve Button (If Doubtful status exists) */}
                            {(halalStatus.overall_status?.toLowerCase() === 'musbooh' ||
                                halalStatus.overall_status?.toLowerCase() === 'mushbooh' ||
                                halalStatus.overall_status?.toLowerCase() === 'doubtful' ||
                                halalStatus.overall_status?.toLowerCase() === 'doubt') && (
                                    <TouchableOpacity
                                        style={styles.improveButtonOutline}
                                        onPress={() => setIsImproveModalVisible(true)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.improveButtonIconContainer}>
                                            <Icon name="cloud-upload" size={18} color={Theme.color.COLOR_PRIMARY_GREEN} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <SmallText textStyles={styles.improveButtonText} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                Help us improve this scan
                                            </SmallText>
                                            <SmallText textStyles={styles.improveButtonSub} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>
                                                Add barcode, manufacturer & extra photos
                                            </SmallText>
                                        </View>
                                        <Icon name="add" size={20} color={Theme.color.COLOR_PRIMARY_GREEN} />
                                    </TouchableOpacity>
                                )}

                            {/* AI reasoning Accordion Card */}
                            {halalStatus.reasoning && (
                                <View style={[styles.accordionCard, Theme.shadows.sh_card]}>
                                    <TouchableOpacity
                                        style={styles.accordionHeader}
                                        onPress={() => setReasonOpen(!reasonOpen)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.accordionIconContainer}>
                                            <Icon name="sparkles" size={16} color={Theme.color.COLOR_PRIMARY_GREEN} />
                                        </View>
                                        <View style={styles.accordionTitleContainer}>
                                            <SmallText textStyles={styles.accordionSub} size={2.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                AI REASONING
                                            </SmallText>
                                            <SmallText textStyles={styles.accordionTitle} size={3.6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                Why this verdict?
                                            </SmallText>
                                        </View>
                                        <Icon
                                            name={reasonOpen ? "chevron-up" : "chevron-down"}
                                            size={20}
                                            color={Theme.color.COLOR_MUTED}
                                        />
                                    </TouchableOpacity>
                                    {reasonOpen && (
                                        <View style={styles.accordionContent}>
                                            <SmallText textStyles={styles.reasoningText} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                                                {halalStatus.reasoning}
                                            </SmallText>
                                            <View style={styles.infoBadgeRow}>
                                                <Icon name="information-circle-outline" size={16} color={Theme.color.COLOR_MUTED} />
                                                <SmallText textStyles={styles.infoBadgeText} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                                                    Verdict generated by Halal-Check AI. Cross-checked against registered AMJA, IFANCA, and JAKIM databases.
                                                </SmallText>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Ingredients Analysis List Container */}
                            {halalStatus.ingredients_analysis && halalStatus.ingredients_analysis.length > 0 && (
                                <View style={styles.ingredientsListWrapper}>
                                    <View style={styles.sectionHeader}>
                                        <SmallText
                                            textStyles={styles.ingredientsStatusTitle}
                                            size={4}
                                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                        >
                                            Ingredient Breakdown
                                        </SmallText>
                                        <View style={styles.badge}>
                                            <SmallText textStyles={styles.badgeText} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                {halalStatus.ingredients_analysis.length} Detected
                                            </SmallText>
                                        </View>
                                    </View>

                                    <View style={[styles.breakdownCardContainer, Theme.shadows.sh_card]}>
                                        {(halalStatus.ingredients_analysis || []).map((item: any, index: number) => {
                                            const isExpanded = expandedIngredients.includes(index);
                                            const hasNote = !!item.note;
                                            const itemColor = getStatusColor(item.status);
                                            const itemBg = getStatusBgColor(item.status);
                                            const isLast = index === (halalStatus.ingredients_analysis || []).length - 1;

                                            return (
                                                <View
                                                    key={index}
                                                    style={[
                                                        styles.breakdownItemRow,
                                                        !isLast && styles.breakdownRowBorder
                                                    ]}
                                                >
                                                    <TouchableOpacity
                                                        onPress={() => hasNote && toggleIngredient(index)}
                                                        activeOpacity={hasNote ? 0.7 : 1}
                                                        style={styles.breakdownItemHeader}
                                                    >
                                                        {/* Status Indicator Dot with outer glow border */}
                                                        <View style={[
                                                            styles.indicatorDotContainer,
                                                            { borderColor: itemBg }
                                                        ]}>
                                                            <View style={[styles.indicatorDot, { backgroundColor: itemColor }]} />
                                                        </View>

                                                        <View style={styles.breakdownItemNameContainer}>
                                                            <SmallText
                                                                textStyles={{
                                                                    ...styles.ingredientName,
                                                                    color: item.status?.toLowerCase() === 'halal' ? Theme.color.COLOR_INK : itemColor
                                                                }}
                                                                size={3.4}
                                                                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                                            >
                                                                {item.component_name}
                                                            </SmallText>
                                                            {!isExpanded && hasNote && (
                                                                <SmallText textStyles={styles.ingredientNotePreview} size={2.8} numberOfLines={1} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                                                                    {item.note}
                                                                </SmallText>
                                                            )}
                                                        </View>

                                                        {/* Status Pill */}
                                                        <View style={[
                                                            styles.ingredientStatusBadge,
                                                            { backgroundColor: itemBg }
                                                        ]}>
                                                            <SmallText
                                                                textStyles={{
                                                                    ...styles.ingredientStatusBadgeText,
                                                                    color: itemColor
                                                                }}
                                                                size={2.4}
                                                                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                                            >
                                                                {item.status?.toUpperCase()}
                                                            </SmallText>
                                                        </View>

                                                        {hasNote && (
                                                            <Icon
                                                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                                                size={16}
                                                                color={Theme.color.COLOR_MUTED_2}
                                                                style={{ marginLeft: 6 }}
                                                            />
                                                        )}
                                                    </TouchableOpacity>

                                                    {isExpanded && hasNote && (
                                                        <View style={styles.breakdownItemNoteExpanded}>
                                                            <SmallText textStyles={styles.ingredientNoteFull} size={3} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                                                                {item.note}
                                                            </SmallText>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}


                        </>
                    ) : null}
                </View>

                {/* Bottom Action Button */}
                {!isCheckingHalal && halalStatus && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.primaryButton, Theme.shadows.sh_button]}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Icon name="scan" size={20} color={Theme.color.COLOR_WHITE} style={styles.buttonIcon} />
                            <SmallText textStyles={styles.primaryButtonText} size={3.6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                Scan Another Product
                            </SmallText>
                        </TouchableOpacity>
                    </View>
                )}
            </ScreenWrapper>

            {/* Improvement Modal - Premium Dark Emerald Glassmorphic Sheet */}
            <Modal
                visible={isImproveModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsImproveModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Pull notch */}
                        <View style={styles.modalNotch} />

                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Icon name="help-buoy" size={26} color={Theme.color.COLOR_WHITE} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <SmallText textStyles={styles.modalTitle} size={4.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Help Us Improve!
                                </SmallText>
                                <SmallText textStyles={styles.modalSubTitle} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    ADDITIONAL DETAILS REQUIRED
                                </SmallText>
                            </View>
                            <TouchableOpacity style={styles.modalCloseIconBtn} onPress={() => setIsImproveModalVisible(false)}>
                                <Icon name="close" size={24} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height(50) }}>
                            <SmallText textStyles={styles.modalDescription} size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                                Capture or choose clear photos of the front, back, or other supporting details of the product to help verify it accurately.
                            </SmallText>

                            <View style={styles.specificImageSection}>
                                <TouchableOpacity
                                    style={[styles.specificImageRow, frontImageImprove && styles.specificImageRowActive]}
                                    onPress={() => handleCaptureImage('front')}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flex: 1 }}>
                                        <SmallText textStyles={styles.fieldLabel} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                            Front Image
                                        </SmallText>
                                        <SmallText textStyles={styles.fieldSubLabel} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                                            Front photo of the product packaging
                                        </SmallText>
                                    </View>
                                    <View style={[styles.captureButton, frontImageImprove && styles.captureButtonActive]}>
                                        {frontImageImprove ? (
                                            <Image source={{ uri: frontImageImprove }} style={styles.previewThumbnail} />
                                        ) : (
                                            <Icon name="image" size={22} color={Theme.color.COLOR_WHITE} />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.specificImageRow, backImageImprove && styles.specificImageRowActive]}
                                    onPress={() => handleCaptureImage('back')}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flex: 1 }}>
                                        <SmallText textStyles={styles.fieldLabel} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                            Back Image
                                        </SmallText>
                                        <SmallText textStyles={styles.fieldSubLabel} size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                                            Back photo with full ingredients list
                                        </SmallText>
                                    </View>
                                    <View style={[styles.captureButton, backImageImprove && styles.captureButtonActive]}>
                                        {backImageImprove ? (
                                            <Image source={{ uri: backImageImprove }} style={styles.previewThumbnail} />
                                        ) : (
                                            <Icon name="image" size={22} color={Theme.color.COLOR_WHITE} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.additionalImagesSection}>
                                <SmallText textStyles={styles.fieldLabel} size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                    Other Images
                                </SmallText>
                                <View style={styles.additionalImagesGrid}>
                                    {additionalImages.map((uri, index) => (
                                        <View key={index} style={styles.additionalImageWrapper}>
                                            <Image source={{ uri }} style={styles.additionalImage} />
                                            <TouchableOpacity
                                                style={styles.removeImageButton}
                                                onPress={() => setAdditionalImages(additionalImages.filter((_, i) => i !== index))}
                                            >
                                                <Icon name="close-circle" size={22} color={Theme.color.COLOR_HARAM} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {additionalImages.length < 3 && (
                                        <TouchableOpacity style={styles.addImageButton} onPress={() => handleCaptureImage('additional')}>
                                            <Icon name="add" size={28} color="rgba(255,255,255,0.7)" />
                                            <SmallText textStyles={{ color: 'rgba(255,255,255,0.7)' }} size={2.2} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>Add Photo</SmallText>
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
                                    <ActivityIndicator color={Theme.color.COLOR_PRIMARY_GREEN} />
                                ) : (
                                    <SmallText textStyles={styles.modalSubmitText} size={3.6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                        Submit Feedback
                                    </SmallText>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsImproveModalVisible(false)}>
                                <SmallText textStyles={styles.modalCloseText} size={3} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM}>Maybe Later</SmallText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.color.COLOR_BG,
        flex: 1,
    },
    header: {
        alignItems: 'center',
        // backgroundColor: Theme.color.COLOR_WHITE,
        borderBottomColor: Theme.color.COLOR_BORDER,
        borderBottomWidth: 1,
        flexDirection: 'row',
        paddingBottom: height(1.5),
        paddingHorizontal: width(4),
        paddingTop: height(1),
    },
    backButton: {
        alignItems: 'center',
        borderRadius: width(5.5),
        height: width(11),
        justifyContent: 'center',
        width: width(11),
    },
    headerTitleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        color: Theme.color.COLOR_INK,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: width(4.5),
        paddingBottom: height(6),
    },
    imagesCarousel: {
        marginBottom: height(2.5),
    },
    imagesCarouselContent: {
        gap: width(3.5),
        paddingRight: width(4.5),
    },
    imageCard: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 20,
        height: height(22),
        overflow: 'hidden',
        width: width(68),
    },
    capturedImage: {
        height: '100%',
        width: '100%',
    },
    imageOverlay: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        bottom: 0,
        flexDirection: 'row',
        gap: 6,
        left: 0,
        paddingHorizontal: width(3.5),
        paddingVertical: height(0.8),
        position: 'absolute',
        right: 0,
    },
    imageLabel: {
        color: Theme.color.COLOR_WHITE,
    },
    halalCheckContainer: {
        marginBottom: height(2),
    },
    productNameContainer: {
        marginBottom: height(2),
        paddingHorizontal: 4,
    },
    productNameLabel: {
        color: Theme.color.COLOR_MUTED_2,
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    productNameText: {
        color: Theme.color.COLOR_INK,
    },
    loadingContainer: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_BORDER,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        padding: width(8),
    },
    loadingText: {
        color: Theme.color.COLOR_INK,
        marginTop: height(2),
    },
    loadingSubtext: {
        color: Theme.color.COLOR_MUTED,
        marginTop: height(0.6),
    },
    errorContainer: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: '#FEE2E2',
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        padding: width(8),
    },
    errorTitle: {
        color: Theme.color.COLOR_HARAM,
        marginBottom: height(0.8),
        marginTop: height(1.5),
        textAlign: 'center',
    },
    errorText: {
        color: Theme.color.COLOR_MUTED,
        lineHeight: 18,
        marginBottom: height(2.5),
        textAlign: 'center',
    },
    retryButton: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 14,
        flexDirection: 'row',
        paddingHorizontal: width(6),
        paddingVertical: height(1.4),
    },
    retryIcon: {
        marginRight: 6,
    },
    retryButtonText: {
        color: Theme.color.COLOR_WHITE,
    },
    overallStatusCard: {
        borderRadius: 24,
        borderWidth: 1.5,
        marginBottom: height(2.5),
        padding: width(5.5),
    },
    overallStatusHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: width(4),
    },
    statusIconContainer: {
        alignItems: 'center',
        borderRadius: width(8),
        height: width(16),
        justifyContent: 'center',
        width: width(16),
    },
    overallStatusTextContainer: {
        flex: 1,
    },
    overallStatusLabel: {
        color: Theme.color.COLOR_MUTED,
        letterSpacing: 0.8,
    },
    overallStatusText: {
        lineHeight: width(8.5),
        marginBottom: 2,
        marginTop: 1,
    },
    overallStatusLabelText: {
        color: Theme.color.COLOR_MUTED,
    },
    tallyDivider: {
        borderColor: 'rgba(15, 20, 17, 0.12)',
        borderStyle: 'dashed',
        borderWidth: 0.8,
        height: 1,
        marginVertical: height(2),
    },
    tallyRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    tallyColumn: {
        alignItems: 'center',
        flex: 1,
    },
    tallyCount: {
        lineHeight: width(7.5),
    },
    tallyLabel: {
        color: Theme.color.COLOR_MUTED,
        letterSpacing: 0.4,
        marginTop: 2,
    },
    accordionCard: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_BORDER,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: height(2.5),
        overflow: 'hidden',
    },
    accordionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        padding: width(4.5),
    },
    accordionIconContainer: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN_BG,
        borderRadius: 10,
        height: 32,
        justifyContent: 'center',
        width: 32,
    },
    accordionTitleContainer: {
        flex: 1,
    },
    accordionSub: {
        color: Theme.color.COLOR_PRIMARY_GREEN,
        letterSpacing: 0.8,
    },
    accordionTitle: {
        color: Theme.color.COLOR_INK,
        marginTop: 1,
    },
    accordionContent: {
        borderTopColor: Theme.color.COLOR_BORDER,
        borderTopWidth: 1,
        paddingBottom: width(4.5),
        paddingHorizontal: width(4.5),
        paddingTop: 14,
    },
    reasoningText: {
        color: Theme.color.COLOR_MUTED,
        lineHeight: 20,
    },
    infoBadgeRow: {
        alignItems: 'flex-start',
        backgroundColor: Theme.color.COLOR_BG,
        borderColor: Theme.color.COLOR_BORDER,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 8,
        marginTop: 14,
        padding: 10,
    },
    infoBadgeText: {
        color: Theme.color.COLOR_MUTED,
        flex: 1,
        lineHeight: 15,
    },
    ingredientsListWrapper: {
        marginBottom: height(2.5),
    },
    sectionHeader: {
        alignItems: 'baseline',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: height(1.2),
        paddingHorizontal: 4,
    },
    ingredientsStatusTitle: {
        color: Theme.color.COLOR_INK,
    },
    badge: {
        backgroundColor: 'transparent',
    },
    badgeText: {
        color: Theme.color.COLOR_MUTED,
    },
    breakdownCardContainer: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_BORDER,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    breakdownItemRow: {
        paddingHorizontal: width(4),
    },
    breakdownRowBorder: {
        borderBottomColor: Theme.color.COLOR_BORDER,
        borderBottomWidth: 1,
    },
    breakdownItemHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 14,
    },
    indicatorDotContainer: {
        alignItems: 'center',
        borderRadius: 7,
        borderWidth: 3,
        height: 14,
        justifyContent: 'center',
        marginRight: 10,
        width: 14,
    },
    indicatorDot: {
        borderRadius: 3,
        height: 6,
        width: 6,
    },
    breakdownItemNameContainer: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 6,
    },
    ingredientName: {
        lineHeight: 18,
    },
    ingredientNotePreview: {
        color: Theme.color.COLOR_MUTED_2,
        marginTop: 1,
    },
    ingredientStatusBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    ingredientStatusBadgeText: {
        letterSpacing: 0.5,
    },
    breakdownItemNoteExpanded: {
        borderTopColor: '#FAFAFA',
        borderTopWidth: 1,
        paddingBottom: 14,
        paddingHorizontal: width(6),
        paddingTop: 10,
    },
    ingredientNoteFull: {
        color: Theme.color.COLOR_MUTED,
        lineHeight: 16,
    },
    improveButtonOutline: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1.5,
        flexDirection: 'row',
        gap: 12,
        marginBottom: height(2.5),
        padding: 16,
    },
    improveButtonIconContainer: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN_BG,
        borderRadius: 12,
        height: 36,
        justifyContent: 'center',
        width: 36,
    },
    improveButtonText: {
        color: Theme.color.COLOR_INK,
    },
    improveButtonSub: {
        color: Theme.color.COLOR_MUTED,
        marginTop: 2,
    },
    actionsContainer: {
        marginTop: height(2),
    },
    primaryButton: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 18,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        paddingVertical: height(2),
    },
    buttonIcon: {
        marginRight: 2,
    },
    primaryButtonText: {
        color: Theme.color.COLOR_WHITE,
    },
    // Modal / Bottom Sheet Styles
    modalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#074330', // Dark Emerald background matching login/signup
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: width(6),
        paddingBottom: Platform.OS === 'ios' ? height(5) : height(3.5),
        maxHeight: height(80),
    },
    modalNotch: {
        alignSelf: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 2,
        height: 4,
        marginBottom: 15,
        width: 40,
    },
    modalHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        marginBottom: height(2.5),
    },
    modalIconContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 14,
        borderWidth: 1,
        height: 44,
        justifyContent: 'center',
        width: 44,
    },
    modalTitle: {
        color: Theme.color.COLOR_WHITE,
        marginBottom: 1,
    },
    modalSubTitle: {
        color: '#A8DCC1',
        letterSpacing: 0.8,
    },
    modalCloseIconBtn: {
        padding: 4,
    },
    modalDescription: {
        color: 'rgba(255, 255, 255, 0.75)',
        lineHeight: 18,
        marginBottom: height(2.5),
    },
    specificImageSection: {
        marginBottom: height(1.5),
    },
    specificImageRow: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        padding: 14,
    },
    specificImageRowActive: {
        backgroundColor: 'rgba(168, 220, 193, 0.1)',
        borderColor: 'rgba(168, 220, 193, 0.4)',
    },
    fieldLabel: {
        color: Theme.color.COLOR_WHITE,
        marginBottom: 1,
    },
    fieldSubLabel: {
        color: 'rgba(255, 255, 255, 0.55)',
    },
    captureButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        height: 46,
        justifyContent: 'center',
        width: 46,
    },
    captureButtonActive: {
        overflow: 'hidden',
        padding: 0,
    },
    previewThumbnail: {
        height: '100%',
        width: '100%',
    },
    additionalImagesSection: {
        marginBottom: height(2.5),
        marginTop: height(1),
    },
    additionalImagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: width(3),
    },
    additionalImageWrapper: {
        borderRadius: 14,
        height: width(25),
        position: 'relative',
        width: width(25),
    },
    additionalImage: {
        borderColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14,
        borderWidth: 1,
        height: '100%',
        width: '100%',
    },
    removeImageButton: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 11,
        position: 'absolute',
        right: -6,
        top: -6,
    },
    addImageButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 14,
        borderStyle: 'dashed',
        borderWidth: 1.5,
        height: width(25),
        justifyContent: 'center',
        width: width(25),
    },
    modalFooter: {
        gap: 6,
        marginTop: height(1.5),
    },
    modalSubmitButton: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 18,
        justifyContent: 'center',
        paddingVertical: height(1.8),
    },
    modalSubmitText: {
        color: '#074330',
    },
    modalCloseButton: {
        alignItems: 'center',
        paddingVertical: height(1.2),
    },
    modalCloseText: {
        color: 'rgba(255, 255, 255, 0.65)',
        textDecorationLine: 'underline',
    },
});

export default IngredientsResult;
