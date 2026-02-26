import { StyleSheet, View, FlatList, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScanHistoryItem } from '../../redux/slices/scanHistory/types';
import { scanHistoryStorage } from '../../utils/scanHistoryStorage';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types/RootParamList';

type HistoryNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const History = () => {
    const navigation = useNavigation<HistoryNavigationProp>();
    const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load history when component mounts or comes into focus
    const loadHistory = async () => {
        try {
            const history = await scanHistoryStorage.getHistory();
            setScanHistory(history);
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    // Reload history when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadHistory();
        }, [])
    );

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
                        try {
                            const updatedHistory = await scanHistoryStorage.deleteScan(id);
                            setScanHistory(updatedHistory);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete scan from history');
                        }
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
                        try {
                            await scanHistoryStorage.clearHistory();
                            setScanHistory([]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear history');
                        }
                    },
                },
            ]
        );
    };

    // Handle refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    // Handle item press - navigate to results
    const handleItemPress = (item: ScanHistoryItem) => {
        navigation.navigate('IngredientsResult', {
            ingredients: item.ingredients,
            imageUri: item.imageUri || '',
            halalCheckResult: item.halalCheckResult, // Pass pre-loaded result
        });
    };

    // Render history item
    const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => {
        const status = item.halalCheckResult?.overall_status || 'unknown';
        const ingredientsPreview = item.ingredients.length > 80
            ? item.ingredients.substring(0, 80) + '...'
            : item.ingredients;

        return (
            <TouchableOpacity
                style={styles.historyCard}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.cardContent}>
                    {/* Image or Icon */}
                    <View style={styles.imageContainer}>
                        {item.imageUri ? (
                            <Image
                                source={{ uri: item.imageUri }}
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
                {scanHistory.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearAllButton}
                        onPress={handleClearAll}
                        activeOpacity={0.7}
                    >
                        <Icon name="trash" size={18} color={Theme.color.COLOR_RED} />
                        <SmallText
                            size={3}
                            fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}
                            color={Theme.color.COLOR_RED}
                            textStyles={styles.clearAllText}
                        >
                            Clear All
                        </SmallText>
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
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
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
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
    },
    clearAllText: {
        marginLeft: 2,
    },
    countContainer: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    listContentEmpty: {
        flexGrow: 1,
    },
    historyCard: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        marginBottom: 16,
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
        padding: 16,
        alignItems: 'flex-start',
    },
    imageContainer: {
        marginRight: 12,
    },
    thumbnail: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
    },
    placeholderIcon: {
        width: 70,
        height: 70,
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
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
        marginBottom: 8,
    },
    statusText: {
        letterSpacing: 0.5,
    },
    ingredientsText: {
        lineHeight: 20,
        marginBottom: 8,
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
        padding: 8,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: `${Theme.color.COLOT_SUBTEXT}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        paddingVertical: 14,
        paddingHorizontal: 28,
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