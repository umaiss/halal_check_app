import React, { useState, useEffect, useCallback } from 'react';
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
import { useGetHistoryQuery, useSearchProductsQuery } from '../../redux/scanApi/scanApi';
import { ScanHistoryItem } from '../../redux/slices/scanHistory/types';
import { uploadImageToBackend } from '../../utils/imageUpload';
import Theme from '../../theme/theme';
import { SmallText, MediumText, LargeText } from '../../components/text';
import Input from '../../components/input';
import styles from './styles';

type HomeNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<BottomTabParamList, 'Home'>,
    NativeStackNavigationProp<RootStackParamList>
>;

function Home() {
    const navigation = useNavigation<HomeNavigationProp>();
    const route = useRoute<RouteProp<BottomTabParamList, 'Home'>>();

    const { user } = useSelector((state: RootState) => state.auth);

    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Call suggestion query when search query has 2+ characters
    const { data: suggestions } = useSearchProductsQuery(searchQuery.trim(), {
        skip: searchQuery.trim().length < 2 || !showSuggestions,
    });

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
                imageUri: item.front_image || item.back_image || item.ingredients_image || '',
                frontImage: item.front_image,
                backImage: item.back_image,
                ingredientsImage: item.ingredients_image,
                timestamp: new Date(item.saved_at).getTime(),
                halalCheckResult: {
                    id: item.id,
                    overall_status: item.overall_status,
                    reasoning: item.reasoning,
                    ingredients_analysis: item.ingredients_analysis
                }
            }));
            setRecentScans(mappedHistory.slice(0, 3));
        }
    }, [apiHistory]);


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
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity 
                            style={styles.historyBtn} 
                            onPress={() => navigation.navigate('Search')}
                            activeOpacity={0.7}
                        >
                            <Icon name="search-outline" size={20} color={Theme.color.COLOR_INK} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.historyBtn} 
                            onPress={() => navigation.navigate('History')}
                            activeOpacity={0.7}
                        >
                            <Icon name="time-outline" size={20} color={Theme.color.COLOR_INK} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hero Scan Box */}
                <View style={styles.cardWrapper}>
                    <SmallText size={3} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_PRIMARY_GREEN} textStyles={{ letterSpacing: 1 }}>
                        NEW SCAN
                    </SmallText>
                    <LargeText size={5.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK} textStyles={{ marginTop: 4, marginBottom: 6 }}>
                        Check a product&apos;s ingredients
                    </LargeText>
                    <SmallText size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR} color={Theme.color.COLOR_MUTED} textStyles={{ marginBottom: 18 }}>
                        Capture a photo of the ingredients list on any product to instantly verify its Halal status.
                    </SmallText>

                    {/* Scan Ingredients Button - Large & Premium */}
                    <TouchableOpacity
                        style={styles.scanButtonBig}
                        onPress={() => {
                            navigation.navigate('Scan', {
                                slotKey: 'ingredients'
                            });
                        }}
                        activeOpacity={0.85}
                    >
                        <View style={styles.scanButtonContent}>
                            <View style={styles.scanIconContainer}>
                                <Icon name="camera" size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.scanTextContainer}>
                                <MediumText size={4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color="#FFFFFF">
                                    Scan Ingredients
                                </MediumText>
                                <SmallText size={2.8} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR} color="rgba(255, 255, 255, 0.85)" textStyles={{ marginTop: 1 }}>
                                    Snap or upload a photo of the ingredients list
                                </SmallText>
                            </View>
                            <Icon name="chevron-forward" size={18} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.searchDivider} />

                    {/* Search Field */}
                    <View style={styles.searchSection}>
                        <SmallText size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK} textStyles={{ marginBottom: 8, letterSpacing: 0.5 }}>
                            OR SEARCH PRODUCTS
                        </SmallText>
                        <Input
                            placeholder="Search verified products by name..."
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                setShowSuggestions(true);
                            }}
                            containerStyle={{ marginHorizontal: 0 }}
                            icon={<Icon name="search-outline" size={18} color={Theme.color.COLOR_MUTED_2} style={{ marginRight: 8 }} />}
                            renderRightIcon={
                                searchQuery ? (
                                    <TouchableOpacity onPress={() => { setSearchQuery(''); setShowSuggestions(false); }}>
                                        <Icon name="close-circle" size={18} color={Theme.color.COLOR_MUTED_2} />
                                    </TouchableOpacity>
                                ) : undefined
                            }
                        />
                    </View>

                    {/* Suggestions Autocomplete List Overlay */}
                    {showSuggestions && suggestions && suggestions.length > 0 && searchQuery.trim().length >= 2 && (
                        <View style={styles.suggestionsContainer}>
                            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }} nestedScrollEnabled>
                                {suggestions.map((item: any) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.suggestionItem}
                                        onPress={() => {
                                            setShowSuggestions(false);
                                            setSearchQuery('');
                                            navigation.navigate('IngredientsResult', {
                                                ingredients: item.ingredient_text,
                                                ingredients_hash: item.ingredients_hash || '',
                                                productName: item.product_name,
                                                imageUri: item.front_image || item.back_image || item.ingredients_image || '',
                                                frontImage: item.front_image,
                                                backImage: item.back_image,
                                                ingredientsImage: item.ingredients_image,
                                                halalCheckResult: {
                                                    id: item.id,
                                                    overall_status: item.overall_status,
                                                    reasoning: item.reasoning,
                                                    ingredients_analysis: item.ingredients_analysis
                                                }
                                            });
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <View style={styles.scanThumbnail}>
                                                {item.front_image || item.back_image || item.ingredients_image ? (
                                                    <Image source={{ uri: item.front_image || item.back_image || item.ingredients_image }} style={{ width: '100%', height: '100%' }} />
                                                ) : (
                                                    <Icon name="fast-food-outline" size={18} color={Theme.color.COLOR_MUTED} />
                                                )}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <MediumText size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK} numberOfLines={1}>
                                                    {item.product_name}
                                                </MediumText>
                                            </View>
                                        </View>
                                        <View style={[styles.suggestionStatusBadge, { backgroundColor: getStatusBgColor(item.overall_status) }]}>
                                            <SmallText size={2.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={getStatusColor(item.overall_status)}>
                                                {(item.overall_status || 'doubtful').toUpperCase()}
                                            </SmallText>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

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
