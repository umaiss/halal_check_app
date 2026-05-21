import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect , CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import CryptoJS from 'crypto-js';

import TextRecognition from '@react-native-ml-kit/text-recognition';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types/RootParamList';
import { RootState } from '../../redux/store';
import { useGetHistoryQuery } from '../../redux/scanApi/scanApi';
import { ScanHistoryItem } from '../../redux/slices/scanHistory/types';
import { uploadImageToSupabase } from '../../utils/imageUpload';
import Theme from '../../theme/theme';
import { SmallText, MediumText, LargeText } from '../../components/text';
import Input from '../../components/input';
import styles from './styles';

type HomeNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<BottomTabParamList, 'Home'>,
    NativeStackNavigationProp<RootStackParamList>
>;

const PHOTO_SLOTS = [
    { k: 'front' as const, label: 'Front of pack', sub: 'Brand & product name', hint: 'Show the front cover of the package.' },
    { k: 'back' as const, label: 'Back of pack', sub: 'Manufacturer, barcode', hint: 'Show the back of the package.' },
    { k: 'ingredients' as const, label: 'Ingredients', sub: 'Full ingredients list', hint: 'Zoom in on the ingredients list.' },
];

function Home() {
    const navigation = useNavigation<HomeNavigationProp>();
    const route = useRoute<RouteProp<BottomTabParamList, 'Home'>>();

    const { user } = useSelector((state: RootState) => state.auth);

    const [productName, setProductName] = useState('');
    const [photos, setPhotos] = useState<{
        front?: string;
        back?: string;
        ingredients?: string;
    }>({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch API Scan History
    const { data: apiHistory, refetch } = useGetHistoryQuery();
    const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Map API History to ScanHistoryItem
    useEffect(() => {
        if (apiHistory && Array.isArray(apiHistory)) {
            const mappedHistory: ScanHistoryItem[] = apiHistory.map((item: any) => ({
                id: item.id.toString(),
                ingredients: item.ingredient_text,
                productName: item.product_name,
                imageUri: item.front_image || item.ingredients_image || '',
                frontImage: item.front_image,
                backImage: item.back_image,
                ingredientsImage: item.ingredients_image,
                timestamp: new Date(item.saved_at).getTime(),
                halalCheckResult: {
                    overall_status: item.overall_status,
                    reasoning: item.reasoning,
                    ingredients_analysis: item.ingredients_analysis
                }
            }));
            setRecentScans(mappedHistory.slice(0, 3));
        }
    }, [apiHistory]);

    // Handle returned photo from camera / Scan screen
    useEffect(() => {
        if (route.params?.capturedPhoto) {
            const { slotKey, uri } = route.params.capturedPhoto;
            setPhotos(prev => ({
                ...prev,
                ...route.params?.existingPhotos,
                [slotKey]: uri,
            }));
            // Immediately clear param to prevent repeat updates
            navigation.setParams({ capturedPhoto: undefined, existingPhotos: undefined });
        }
    }, [route.params?.capturedPhoto, route.params?.existingPhotos, navigation]);

    const removePhoto = (key: 'front' | 'back' | 'ingredients') => {
        setPhotos(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const resetAll = () => {
        setPhotos({});
        setProductName('');
    };

    const handleRecentScanPress = (item: ScanHistoryItem) => {
        navigation.navigate('IngredientsResult', {
            ingredients: item.ingredients,
            ingredients_hash: '', 
            imageUri: item.imageUri || '',
            frontImage: item.frontImage,
            backImage: item.backImage,
            ingredientsImage: item.ingredientsImage,
            productName: item.productName || '',
            halalCheckResult: item.halalCheckResult, 
        });
    };

    const getInitials = (name?: string) => {
        if (!name) return 'JM';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const processImageWithTextRecognition = async (imagePath: string) => {
        try {
            console.log('Processing image with Text Recognition:', imagePath);
            const result: any = await TextRecognition.recognize(imagePath);

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
        } catch (error) {
            console.error('Error in processImageWithTextRecognition:', error);
            throw error;
        }
    };

    const handleProcess = async () => {
        if (!photos.ingredients) {
            Alert.alert('Required', 'Please capture or select the ingredients image.');
            return;
        }
        if (!productName.trim()) {
            Alert.alert('Required', 'Please enter a product name.');
            return;
        }

        setIsProcessing(true);
        try {
            const safeUpload = async (uri: string | undefined): Promise<string> => {
                if (!uri) return '';
                try {
                    return await uploadImageToSupabase(uri, 'halal-images', productName);
                } catch (e) {
                    console.error('Failed to upload image:', e);
                    return '';
                }
            };

            // Concurrent uploads to Supabase
            const frontUploadPromise = safeUpload(photos.front);
            const backUploadPromise = safeUpload(photos.back);
            const ingredientsUploadPromise = safeUpload(photos.ingredients);

            // Concurrent Text Recognition
            const imagePath = Platform.OS === 'android'
                ? photos.ingredients
                : photos.ingredients.replace('file://', '');

            const textExtractionPromise = processImageWithTextRecognition(imagePath);

            const [frontUrl, backUrl, ingredientsUrl, extractedText] = await Promise.all([
                frontUploadPromise,
                backUploadPromise,
                ingredientsUploadPromise,
                textExtractionPromise,
            ]);

            if (extractedText) {
                const ingredients_hash = CryptoJS.SHA256(extractedText).toString(CryptoJS.enc.Hex);

                navigation.navigate('IngredientsResult', {
                    ingredients: extractedText,
                    ingredients_hash,
                    productName,
                    imageUri: photos.ingredients,
                    frontImage: frontUrl || undefined,
                    backImage: backUrl || undefined,
                    ingredientsImage: ingredientsUrl || undefined,
                });
            } else {
                Alert.alert('No Text Detected', 'Could not detect ingredients text. Please try again with a clearer photo.');
            }
        } catch (error) {
            console.error('Error processing scan:', error);
            Alert.alert('Error', 'Failed to analyze ingredients. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const allCaptured = !!(photos.front && photos.back && photos.ingredients);
    const canAnalyse = allCaptured && productName.trim().length > 0;
    const capturedCount = Object.keys(photos).length;
    const nextSlot = PHOTO_SLOTS.find(s => !photos[s.k]) || PHOTO_SLOTS[0];

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return Theme.color.COLOR_PRIMARY_GREEN;
            case 'haram':
                return Theme.color.COLOR_HARAM;
            case 'doubtful':
            case 'musbooh':
            case 'mushbooh':
                return Theme.color.COLOR_DOUBTFUL;
            default:
                return Theme.color.COLOR_MUTED;
        }
    };

    const getStatusBgColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return Theme.color.COLOR_PRIMARY_GREEN_BG;
            case 'haram':
                return Theme.color.COLOR_HARAM_BG;
            case 'doubtful':
            case 'musbooh':
            case 'mushbooh':
                return Theme.color.COLOR_DOUBTFUL_BG;
            default:
                return '#F4F6F5';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Row */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity 
                            style={styles.avatarBubble}
                            onPress={() => navigation.navigate('Profile')}
                            activeOpacity={0.8}
                        >
                            <SmallText size={3.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                                {getInitials(user?.name)}
                            </SmallText>
                        </TouchableOpacity>
                        <View>
                            <SmallText size={3} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color={Theme.color.COLOR_MUTED}>
                                Assalamu Alaikum
                            </SmallText>
                            <MediumText size={4.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK}>
                                {user?.name || 'User'}
                            </MediumText>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.historyBtn} 
                        onPress={() => navigation.navigate('History')}
                        activeOpacity={0.7}
                    >
                        <Icon name="time-outline" size={22} color={Theme.color.COLOR_INK} />
                    </TouchableOpacity>
                </View>

                {/* Hero Scan Box */}
                <View style={styles.cardWrapper}>
                    <SmallText size={3} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_PRIMARY_GREEN} textStyles={{ letterSpacing: 1 }}>
                        NEW SCAN
                    </SmallText>
                    <LargeText size={5.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK} textStyles={{ marginTop: 4, marginBottom: 4 }}>
                        Check a product&apos;s ingredients
                    </LargeText>
                    <SmallText size={3.3} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR} color={Theme.color.COLOR_MUTED} textStyles={{ marginBottom: 18 }}>
                        Add the product name and 3 clear photos. We&apos;ll do the rest.
                    </SmallText>

                    {/* Product Name Input */}
                    <Input
                        label="Product Name"
                        placeholder="e.g. Belgian chocolate cookies"
                        value={productName}
                        onChangeText={setProductName}
                        containerStyle={{ marginHorizontal: 0 }}
                        renderRightIcon={
                            productName ? (
                                <TouchableOpacity onPress={() => setProductName('')}>
                                    <Icon name="close-circle" size={18} color={Theme.color.COLOR_MUTED_2} />
                                </TouchableOpacity>
                            ) : undefined
                        }
                    />

                    {/* Photo Slots Section Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 12 }}>
                        <SmallText size={3} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_MUTED}>
                            PHOTOS
                        </SmallText>
                        <View style={{
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            backgroundColor: allCaptured ? Theme.color.COLOR_PRIMARY_GREEN_BG : 'transparent',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 12
                        }}>
                            {allCaptured && <Icon name="checkmark" size={12} color={Theme.color.COLOR_PRIMARY_GREEN} style={{ marginRight: 4 }} />}
                            <SmallText size={3} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={allCaptured ? Theme.color.COLOR_PRIMARY_GREEN : Theme.color.COLOR_MUTED_2}>
                                {capturedCount} / 3
                            </SmallText>
                        </View>
                    </View>

                    {/* Photo Slots Grid */}
                    <View style={styles.slotRow}>
                        {PHOTO_SLOTS.map((slot, index) => {
                            const filled = !!photos[slot.k];
                            const imagePath = photos[slot.k];

                            return (
                                <TouchableOpacity
                                    key={slot.k}
                                    style={[styles.slotItem, filled ? styles.filledSlot : styles.emptySlot]}
                                    onPress={() => {
                                        if (filled) {
                                            removePhoto(slot.k);
                                        } else {
                                            navigation.navigate('Scan', {
                                                slotKey: slot.k,
                                                existingPhotos: photos,
                                            });
                                        }
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {/* Number Badge or Checkmark */}
                                    <View style={[
                                        styles.checkmarkBadge,
                                        {
                                            backgroundColor: filled ? Theme.color.COLOR_PRIMARY_GREEN : '#C5CCC9',
                                            width: 18,
                                            height: 18,
                                            borderRadius: 9,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            left: 6,
                                            top: 6,
                                            position: 'absolute'
                                        }
                                    ]}>
                                        {filled ? (
                                            <Icon name="checkmark" size={10} color="#FFFFFF" />
                                        ) : (
                                            <SmallText size={2.5} color="#FFFFFF" fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                                                {index + 1}
                                            </SmallText>
                                        )}
                                    </View>

                                    {/* Thumbnail or Plus icon */}
                                    {filled && imagePath ? (
                                        <Image source={{ uri: imagePath }} style={styles.slotThumbnail} resizeMode="cover" />
                                    ) : (
                                        <View style={[styles.slotIcon, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ECEFF1', justifyContent: 'center', alignItems: 'center' }]}>
                                            <Icon name="add" size={16} color={Theme.color.COLOR_MUTED} />
                                        </View>
                                    )}

                                    {/* Delete overlay click */}
                                    {filled && (
                                        <TouchableOpacity
                                            style={styles.deleteBadge}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                removePhoto(slot.k);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Icon name="close" size={12} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    )}

                                    {/* Slot titles */}
                                    <View style={{ position: 'absolute', bottom: 8, left: 0, right: 0, paddingHorizontal: 4 }}>
                                        <SmallText size={2.6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={filled ? '#074330' : Theme.color.COLOR_INK} textAlign="center">
                                            {slot.label}
                                        </SmallText>
                                        <SmallText size={2.2} color={filled ? 'rgba(7,67,48,0.7)' : Theme.color.COLOR_MUTED_2} textAlign="center">
                                            {slot.sub}
                                        </SmallText>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Verify Trigger Button */}
                    <TouchableOpacity
                        style={[
                            styles.verifyBtn,
                            { 
                                backgroundColor: canAnalyse ? Theme.color.COLOR_PRIMARY_GREEN : '#ECEFF1',
                                opacity: isProcessing ? 0.8 : 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 8,
                                shadowColor: canAnalyse ? Theme.color.COLOR_PRIMARY_GREEN : 'transparent'
                            }
                        ]}
                        onPress={canAnalyse && !isProcessing ? handleProcess : undefined}
                        disabled={!canAnalyse || isProcessing}
                        activeOpacity={0.8}
                    >
                        {isProcessing ? (
                            <>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <SmallText size={3.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                                    Analyzing...
                                </SmallText>
                            </>
                        ) : (
                            <>
                                <Icon name="sparkles" size={18} color={canAnalyse ? '#FFFFFF' : Theme.color.COLOR_MUTED_2} />
                                <SmallText size={3.8} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={canAnalyse ? '#FFFFFF' : Theme.color.COLOR_MUTED_2}>
                                    {canAnalyse ? 'Analyse with AI' : 
                                     !allCaptured ? `Add ${3 - capturedCount} more photo${3 - capturedCount > 1 ? 's' : ''}` : 
                                     'Add a product name'}
                                </SmallText>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Clear All Trigger */}
                    {(capturedCount > 0 || productName.length > 0) && !isProcessing && (
                        <TouchableOpacity onPress={resetAll} style={{ alignSelf: 'center', marginTop: 12 }}>
                            <SmallText size={3} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color={Theme.color.COLOR_MUTED}>
                                Clear all
                            </SmallText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Quick Capture Shortcut Banner */}
                {capturedCount === 0 && (
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#0F1411',
                            borderRadius: 18,
                            padding: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 24,
                        }}
                        onPress={() => navigation.navigate('Scan', {
                            slotKey: nextSlot.k,
                            existingPhotos: photos,
                        })}
                        activeOpacity={0.8}
                    >
                        <View style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.18)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 14,
                        }}>
                            <Icon name="camera" size={20} color="#FFFFFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <SmallText size={3.6} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                                Open camera
                            </SmallText>
                            <SmallText size={2.8} color="rgba(255, 255, 255, 0.6)" textStyles={{ marginTop: 2 }}>
                                Start with the front of the pack
                            </SmallText>
                        </View>
                        <Icon name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.7)" />
                    </TouchableOpacity>
                )}

                {/* Recent Scans Section */}
                <View>
                    <View style={styles.recentHeader}>
                        <MediumText size={4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK}>
                            Recent scans
                        </MediumText>
                        <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.seeAllLink}>
                            <SmallText size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_PRIMARY_GREEN}>
                                See all
                            </SmallText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.recentScansList}>
                        {recentScans.length > 0 ? (
                            recentScans.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.scanCard}
                                    onPress={() => handleRecentScanPress(item)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.scanCardLeft}>
                                        <View style={styles.scanThumbnail}>
                                            {item.imageUri ? (
                                                <Image source={{ uri: item.imageUri }} style={{ width: '100%', height: '100%' }} />
                                            ) : (
                                                <Icon name="fast-food-outline" size={18} color={Theme.color.COLOR_MUTED} />
                                            )}
                                        </View>
                                        <View style={styles.scanInfo}>
                                            <MediumText size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK} numberOfLines={1}>
                                                {item.productName || 'Unknown Product'}
                                            </MediumText>
                                            <SmallText size={2.8} color={Theme.color.COLOR_MUTED}>
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </SmallText>
                                        </View>
                                    </View>

                                    {/* Status Badge */}
                                    <View style={[
                                        styles.statusBadge, 
                                        { backgroundColor: getStatusBgColor(item.halalCheckResult?.overall_status) }
                                    ]}>
                                        <SmallText 
                                            size={2.6} 
                                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} 
                                            color={getStatusColor(item.halalCheckResult?.overall_status)}
                                        >
                                            {(item.halalCheckResult?.overall_status || 'doubtful').toUpperCase()}
                                        </SmallText>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyRecentContainer}>
                                <Icon name="document-text-outline" size={32} color={Theme.color.COLOR_MUTED_2} />
                                <SmallText size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_MEDIUM} color={Theme.color.COLOR_MUTED} textStyles={styles.emptyRecentText}>
                                    No scans yet. Start scanning now!
                                </SmallText>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Home;
