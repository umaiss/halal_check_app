import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, Alert, RefreshControl, ActivityIndicator, TextInput, Platform, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScanHistoryItem } from '../../redux/slices/scanHistory/types';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import { RootStackParamList, BottomTabParamList } from '../../navigation/types/RootParamList';
import { useGetHistoryQuery } from '../../redux/scanApi/scanApi';
import { height, width } from '../../utils/dimensions';

type HistoryNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<BottomTabParamList, 'History'>,
    NativeStackNavigationProp<RootStackParamList>
>;

function History() {
    const navigation = useNavigation<HistoryNavigationProp>();
    
    // States
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'halal' | 'doubtful' | 'haram'>('all');

    // API hook for history
    const { data: apiHistory, isLoading: isApiLoading, error: apiError, refetch } = useGetHistoryQuery();

    // Reload history when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Update scanHistory when apiHistory changes
    useEffect(() => {
        if (apiHistory && Array.isArray(apiHistory)) {
            // Map API data to ScanHistoryItem format
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
            setScanHistory(mappedHistory);
        }
    }, [apiHistory]);

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

    // Helper function to get status icon
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

    // Format timestamp to relative time
    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };



    // Handle refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Handle item press - navigate to results
    const handleItemPress = (item: ScanHistoryItem) => {
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

    // Filtered scans based on search text and category filter
    const filteredHistory = scanHistory.filter((item) => {
        const matchesSearch = 
            searchQuery.trim() === '' ||
            (item.productName && item.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.ingredients && item.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));

        const itemStatus = item.halalCheckResult?.overall_status?.toLowerCase();
        let matchesStatus = true;
        if (statusFilter === 'halal') {
            matchesStatus = itemStatus === 'halal';
        } else if (statusFilter === 'haram') {
            matchesStatus = itemStatus === 'haram';
        } else if (statusFilter === 'doubtful') {
            matchesStatus = itemStatus === 'doubtful' || itemStatus === 'musbooh' || itemStatus === 'mushbooh' || itemStatus === 'doubt';
        }

        return matchesSearch && matchesStatus;
    });

    // Render history item
    const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => {
        const status = item.halalCheckResult?.overall_status || 'unknown';
        const rawIngredients = item.ingredients || '';
        const ingredientsPreview = rawIngredients.length > 70
            ? `${rawIngredients.substring(0, 70)  }...`
            : rawIngredients;

        const statusColor = getStatusColor(status);
        const statusBg = getStatusBgColor(status);

        return (
            <TouchableOpacity
                style={[styles.historyCard, Theme.shadows.sh_card, { borderLeftColor: statusColor }]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    {/* Thumbnail */}
                    <View style={styles.imageContainer}>
                        {item.frontImage || item.backImage || item.ingredientsImage ? (
                            <Image
                                source={{ uri: item.frontImage || item.backImage || item.ingredientsImage }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderIcon}>
                                <Icon name="barcode-outline" size={24} color={Theme.color.COLOR_PRIMARY_GREEN} />
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.cardDetails}>
                        {/* Status Badge */}
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: statusBg }
                        ]}>
                            <Icon
                                name={getStatusIcon(status)}
                                size={12}
                                color={statusColor}
                            />
                            <SmallText
                                size={2.4}
                                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                textStyles={{ color: statusColor, letterSpacing: 0.4 }}
                            >
                                {status.toUpperCase()}
                            </SmallText>
                        </View>

                        {/* Product Name */}
                        <SmallText
                            size={3.8}
                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                            color={Theme.color.COLOR_INK}
                            textStyles={styles.productNameText}
                            textProps={{ numberOfLines: 1 }}
                        >
                            {item.productName || 'Unnamed Scan'}
                        </SmallText>

                        {/* Ingredients Preview */}
                        <SmallText
                            size={3}
                            color={Theme.color.COLOR_MUTED}
                            textStyles={styles.ingredientsText}
                            textProps={{ numberOfLines: 2 }}
                        >
                            {ingredientsPreview || 'No ingredients text detected'}
                        </SmallText>

                        {/* Timestamp */}
                        <View style={styles.timestampContainer}>
                            <Icon name="time-outline" size={13} color={Theme.color.COLOR_MUTED_2} />
                            <SmallText
                                size={2.6}
                                color={Theme.color.COLOR_MUTED_2}
                                textStyles={styles.timestampText}
                            >
                                {formatTimestamp(item.timestamp)}
                            </SmallText>
                        </View>
                    </View>
            </View>
        </TouchableOpacity>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Icon name="scan-outline" size={64} color={Theme.color.COLOR_MUTED_2} />
            </View>
            <SmallText
                size={4.5}
                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                color={Theme.color.COLOR_INK}
                textStyles={styles.emptyTitle}
            >
                No Matching Scans
            </SmallText>
            <SmallText
                size={3.2}
                color={Theme.color.COLOR_MUTED}
                textStyles={styles.emptySubtitle}
            >
                {searchQuery || statusFilter !== 'all' 
                    ? "Try adjusting your search query or status filter."
                    : "Products you verify will be saved here."}
            </SmallText>
            {(!searchQuery && statusFilter === 'all') && (
                <TouchableOpacity
                    style={[styles.emptyButton, Theme.shadows.sh_button]}
                    onPress={() => navigation.navigate('Home', {})}
                    activeOpacity={0.8}
                >
                    <Icon name="scan" size={18} color={Theme.color.COLOR_WHITE} />
                    <SmallText
                        size={3.4}
                        fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                        color={Theme.color.COLOR_WHITE}
                    >
                        Verify Product Now
                    </SmallText>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon name="time" size={26} color={Theme.color.COLOR_PRIMARY_GREEN} />
                    <SmallText
                        size={5.5}
                        fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                        color={Theme.color.COLOR_INK}
                    >
                        Scan History
                    </SmallText>
                </View>

            </View>

            {/* Modern Search Box */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchBarContainer}>
                    <Icon name="search-outline" size={20} color={Theme.color.COLOR_MUTED_2} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search by product or ingredient..."
                        placeholderTextColor={Theme.color.COLOR_MUTED_2}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        clearButtonMode="while-editing"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={18} color={Theme.color.COLOR_MUTED_2} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category Filter Pills */}
            <View style={styles.filterWrapper}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollViewContent}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterPill,
                            statusFilter === 'all' ? styles.filterPillActive : styles.filterPillInactive
                        ]}
                        onPress={() => setStatusFilter('all')}
                        activeOpacity={0.7}
                    >
                        <SmallText 
                            size={3} 
                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} 
                            textStyles={{ color: statusFilter === 'all' ? Theme.color.COLOR_WHITE : Theme.color.COLOR_MUTED }}
                        >
                            All
                        </SmallText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterPill,
                            statusFilter === 'halal' ? styles.filterPillActiveHalal : styles.filterPillInactive
                        ]}
                        onPress={() => setStatusFilter('halal')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dotFilter, { backgroundColor: Theme.color.COLOR_HALAL }]} />
                        <SmallText 
                            size={3} 
                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} 
                            textStyles={{ color: statusFilter === 'halal' ? Theme.color.COLOR_WHITE : Theme.color.COLOR_HALAL }}
                        >
                            Halal
                        </SmallText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterPill,
                            statusFilter === 'doubtful' ? styles.filterPillActiveDoubtful : styles.filterPillInactive
                        ]}
                        onPress={() => setStatusFilter('doubtful')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dotFilter, { backgroundColor: Theme.color.COLOR_DOUBTFUL }]} />
                        <SmallText 
                            size={3} 
                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} 
                            textStyles={{ color: statusFilter === 'doubtful' ? Theme.color.COLOR_WHITE : Theme.color.COLOR_DOUBTFUL }}
                        >
                            Doubtful
                        </SmallText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filterPill,
                            statusFilter === 'haram' ? styles.filterPillActiveHaram : styles.filterPillInactive
                        ]}
                        onPress={() => setStatusFilter('haram')}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.dotFilter, { backgroundColor: Theme.color.COLOR_HARAM }]} />
                        <SmallText 
                            size={3} 
                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} 
                            textStyles={{ color: statusFilter === 'haram' ? Theme.color.COLOR_WHITE : Theme.color.COLOR_HARAM }}
                        >
                            Haram
                        </SmallText>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* List */}
            {isApiLoading && scanHistory.length === 0 ? (
                <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="large" color={Theme.color.COLOR_PRIMARY_GREEN} />
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.listContent,
                        filteredHistory.length === 0 && styles.listContentEmpty
                    ]}
                    ListEmptyComponent={renderEmptyState}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Theme.color.COLOR_PRIMARY_GREEN}
                        />
                    }
                />
            )}
        </View>
    );
}

export default History;

const styles = StyleSheet.create({
    cardContent: {
        alignItems: 'center',
        flexDirection: 'row',
        padding: 14,
    },
    cardDetails: {
        flex: 1,
    },
    clearAllButton: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_HARAM_BG,
        borderRadius: 10,
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    container: {
        backgroundColor: Theme.color.COLOR_BG,
        flex: 1,
    },
    deleteButton: {
        marginLeft: 4,
        padding: 8,
    },
    dotFilter: {
        borderRadius: 3,
        height: 6,
        width: 6,
    },
    emptyButton: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 16,
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: width(6.5),
        paddingVertical: height(1.6),
    },
    emptyContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: width(10),
    },
    emptyIconContainer: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_BORDER,
        borderRadius: width(14),
        borderWidth: 1,
        height: width(28),
        justifyContent: 'center',
        marginBottom: height(2),
        width: width(28),
    },
    emptySubtitle: {
        lineHeight: 18,
        marginBottom: height(3),
        textAlign: 'center',
    },
    emptyTitle: {
        marginBottom: height(0.6),
        textAlign: 'center',
    },
    filterPill: {
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterPillActive: {
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderColor: Theme.color.COLOR_PRIMARY_GREEN,
    },
    filterPillActiveDoubtful: {
        backgroundColor: Theme.color.COLOR_DOUBTFUL,
        borderColor: Theme.color.COLOR_DOUBTFUL,
    },
    filterPillActiveHalal: {
        backgroundColor: Theme.color.COLOR_HALAL,
        borderColor: Theme.color.COLOR_HALAL,
    },
    filterPillActiveHaram: {
        backgroundColor: Theme.color.COLOR_HARAM,
        borderColor: Theme.color.COLOR_HARAM,
    },
    filterPillInactive: {
        backgroundColor: Theme.color.COLOR_BG,
        borderColor: Theme.color.COLOR_BORDER,
    },
    filterScrollViewContent: {
        gap: width(2.5),
        paddingHorizontal: width(5),
    },
    filterWrapper: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderBottomColor: Theme.color.COLOR_BORDER,
        borderBottomWidth: 1,
        paddingBottom: height(1.5),
    },
    header: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderBottomColor: Theme.color.COLOR_BORDER,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: height(1.5),
        paddingHorizontal: width(5),
        paddingTop: Platform.OS === 'ios' ? height(6) : height(2.5),
    },
    headerLeft: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    historyCard: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_BORDER,
        borderLeftWidth: 4,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: height(1.8),
    },
    imageContainer: {
        marginRight: width(3.5),
    },
    ingredientsText: {
        lineHeight: 16,
        marginBottom: 4,
    },
    listContent: {
        paddingBottom: 110,
        paddingHorizontal: width(4.5),
        paddingTop: height(2),
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    loadingWrapper: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    placeholderIcon: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN_BG,
        borderRadius: 12,
        height: width(16),
        justifyContent: 'center',
        width: width(16),
    },
    productNameText: {
        marginBottom: 2,
    },
    searchBarContainer: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_BG,
        borderColor: Theme.color.COLOR_BORDER,
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        height: 48,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        color: Theme.color.COLOR_INK,
        flex: 1,
        fontFamily: Theme.fonts.FONT_NUNITO_REGULAR,
        fontSize: width(3.4),
        padding: 0, // Reset default padding
    },
    searchWrapper: {
        backgroundColor: Theme.color.COLOR_WHITE,
        paddingBottom: height(1),
        paddingHorizontal: width(5),
        paddingTop: height(1.5),
    },
    statusBadge: {
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 8,
        flexDirection: 'row',
        gap: 3,
        marginBottom: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    thumbnail: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        height: width(16),
        width: width(16),
    },
    timestampContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    timestampText: {
        letterSpacing: 0.2,
    },
});