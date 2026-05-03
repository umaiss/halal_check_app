import { StyleSheet, View, FlatList, TouchableOpacity, Image, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScanHistoryItem } from '../../redux/slices/scanHistory/types';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { useGetHistoryQuery } from '../../redux/scanApi/scanApi';
import { height, width } from '../../utils/dimensions';

type HistoryNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const History = () => {
    const navigation = useNavigation<HistoryNavigationProp>();
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

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
            setScanHistory(mappedHistory);
        }
    }, [apiHistory]);

    // Helper function to get status color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return '#22C55E';
            case 'haram':
                return '#EF4444';
            case 'doubtful':
            case 'musbooh':
                return '#F59E0B';
            default:
                return Theme.color.COLOT_SUBTEXT;
        }
    };

    // Helper function to get status background color
    const getStatusBgColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'halal':
                return '#DCFCE7';
            case 'haram':
                return '#FEE2E2';
            case 'doubtful':
            case 'musbooh':
                return '#FEF3C7';
            default:
                return '#F5F5F5';
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
            case 'musbooh':
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

    // Handle delete single item
    const handleDeleteItem = async (id: string) => {
        Alert.alert(
            'Delete Scan',
            'Are you sure you want to delete this scan from history?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        // TODO: Implement API deletion
                        console.log('Delete item:', id);
                    },
                },
            ]
        );
    };

    // Handle clear all history
    const handleClearAll = () => {
        Alert.alert(
            'Clear All History',
            'Are you sure you want to clear all scan history? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        // TODO: Implement API clear all
                        console.log('Clear all history');
                    },
                },
            ]
        );
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
            ingredients_hash: '', // Optional/Not provided by history API yet
            imageUri: item.imageUri || '',
            frontImage: item.frontImage,
            backImage: item.backImage,
            ingredientsImage: item.ingredientsImage,
            halalCheckResult: item.halalCheckResult, // Pass pre-loaded result
        });
    };

    // Render history item
    const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => {
        const status = item.halalCheckResult?.overall_status || 'unknown';
        const rawIngredients = item.ingredients || '';
        const ingredientsPreview = rawIngredients.length > 80
            ? rawIngredients.substring(0, 80) + '...'
            : rawIngredients;

        return (
            <TouchableOpacity
                style={styles.historyCard}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    {/* Image or Icon */}
                    <View style={styles.imageContainer}>
                        {item.frontImage ? (
                            <Image
                                source={{ uri: item.frontImage }}
                                style={styles.thumbnail}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderIcon}>
                                <Icon name="text" size={28} color={Theme.color.COLOR_BLUE} />
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.cardDetails}>
                        {/* Status Badge */}
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusBgColor(status) }
                        ]}>
                            <Icon
                                name={getStatusIcon(status)}
                                size={14}
                                color={getStatusColor(status)}
                            />
                            <SmallText
                                size={2.5}
                                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                color={getStatusColor(status)}
                                textStyles={styles.statusText}
                            >
                                {status.toUpperCase()}
                            </SmallText>
                        </View>

                        {/* Product Name */}
                        {item.productName ? (
                            <SmallText
                                size={4}
                                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                color={Theme.color.COLOR_TEXT}
                                textStyles={styles.productNameText}
                                numberOfLines={1}
                            >
                                {item.productName}
                            </SmallText>
                        ) : null}

                        {/* Ingredients Preview */}
                        <SmallText
                            size={3.2}
                            color={Theme.color.COLOR_TEXT}
                            textStyles={styles.ingredientsText}
                        >
                            {ingredientsPreview}
                        </SmallText>

                        {/* Timestamp */}
                        <View style={styles.timestampContainer}>
                            <Icon name="time-outline" size={14} color={Theme.color.COLOT_SUBTEXT} />
                            <SmallText
                                size={2.5}
                                color={Theme.color.COLOT_SUBTEXT}
                                textStyles={styles.timestampText}
                            >
                                {formatTimestamp(item.timestamp)}
                            </SmallText>
                        </View>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteItem(item.id)}
                        activeOpacity={0.7}
                    >
                        <Icon name="trash-outline" size={20} color={Theme.color.COLOR_RED} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Icon name="scan-outline" size={80} color={Theme.color.COLOT_SUBTEXT} />
            </View>
            <SmallText
                size={5}
                fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                color={Theme.color.COLOR_TEXT}
                textStyles={styles.emptyTitle}
            >
                No Scan History
            </SmallText>
            <SmallText
                size={3.5}
                color={Theme.color.COLOT_SUBTEXT}
                textStyles={styles.emptySubtitle}
            >
                Your scanned ingredients will appear here
            </SmallText>
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
            >
                <Icon name="camera" size={20} color={Theme.color.COLOR_WHITE} style={styles.emptyButtonIcon} />
                <SmallText
                    size={3.5}
                    fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                    color={Theme.color.COLOR_WHITE}
                >
                    Start Scanning
                </SmallText>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon name="time" size={28} color={Theme.color.COLOR_BLUE} />
                    <SmallText
                        size={6}
                        fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                        color={Theme.color.COLOR_TEXT}
                        textStyles={styles.headerTitle}
                    >
                        Scan History
                    </SmallText>
                </View>
                {(scanHistory.length > 0 || isApiLoading) && (
                    <TouchableOpacity
                        style={styles.clearAllButton}
                        onPress={handleClearAll}
                        activeOpacity={0.7}
                    >
                        {isApiLoading ? (
                            <ActivityIndicator size="small" color={Theme.color.COLOR_BLUE} />
                        ) : (
                            <>
                                <Icon name="trash" size={18} color={Theme.color.COLOR_RED} />
                                <SmallText
                                    size={3}
                                    fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                                    color={Theme.color.COLOR_RED}
                                    textStyles={styles.clearAllText}
                                >
                                    Clear All
                                </SmallText>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Scan Count */}
            {scanHistory.length > 0 && (
                <View style={styles.countContainer}>
                    <SmallText
                        size={3.2}
                        color={Theme.color.COLOT_SUBTEXT}
                    >
                        {scanHistory.length} scan{scanHistory.length !== 1 ? 's' : ''} in history
                    </SmallText>
                </View>
            )}

            {/* History List */}
            <FlatList
                data={scanHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    scanHistory.length === 0 && styles.listContentEmpty
                ]}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Theme.color.COLOR_BLUE}
                    />
                }
            />
        </View>
    );
};

export default History;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: height(7.4),
        paddingHorizontal: width(6.4),
        paddingBottom: height(2),
        backgroundColor: Theme.color.COLOR_WHITE,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        marginLeft: 4,
    },
    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: height(1),
        paddingHorizontal: width(3.2),
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
    },
    clearAllText: {
        marginLeft: 2,
    },
    countContainer: {
        paddingHorizontal: width(10.6),
        paddingVertical: height(1.5),
    },
    listContent: {
        paddingHorizontal: width(6.4),
        paddingBottom: height(3),
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    historyCard: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        marginBottom: height(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardContent: {
        flexDirection: 'row',
        padding: width(4.2),
        alignItems: 'flex-start',
    },
    imageContainer: {
        marginRight: width(3.2),
    },
    thumbnail: {
        width: width(18.6),
        height: width(18.6),
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
    },
    placeholderIcon: {
        width: width(18.6),
        height: width(18.6),
        borderRadius: 12,
        backgroundColor: `${Theme.color.COLOR_BLUE}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: width(2.6),
        paddingVertical: height(0.6),
        borderRadius: 8,
        gap: 4,
        marginBottom: height(1),
    },
    statusText: {
        letterSpacing: 0.5,
    },
    ingredientsText: {
        lineHeight: 20,
        marginBottom: height(1),
    },
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timestampText: {
        marginLeft: 2,
    },
    deleteButton: {
        padding: width(2.1),
        marginLeft: width(2.1),
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width(10.6),
    },
    emptyIconContainer: {
        width: width(42.6),
        height: width(42.6),
        borderRadius: width(21.3),
        backgroundColor: `${Theme.color.COLOT_SUBTEXT}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: height(3),
    },
    emptyTitle: {
        textAlign: 'center',
        marginBottom: height(1),
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: height(4),
        lineHeight: 22,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        paddingVertical: height(1.7),
        paddingHorizontal: width(7.4),
        borderRadius: 12,
        gap: 8,
        shadowColor: Theme.color.COLOR_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonIcon: {
        marginRight: 4,
    },
});