import React, { useState } from 'react';
import {
    View,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { useSearchProductsQuery } from '../../redux/scanApi/scanApi';
import Theme from '../../theme/theme';
import { SmallText, MediumText, LargeText } from '../../components/text';
import Input from '../../components/input';
import styles from './styles';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

function Search() {
    const navigation = useNavigation<SearchScreenNavigationProp>();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: results, isFetching } = useSearchProductsQuery(searchQuery.trim(), {
        skip: searchQuery.trim().length < 2,
    });

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

    const handleResultPress = (item: any) => {
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
    };

    const handleScanNewProduct = () => {
        navigation.navigate('Scan', {
            slotKey: 'ingredients',
            productName: searchQuery.trim()
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header with search input */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={24} color={Theme.color.COLOR_INK} />
                </TouchableOpacity>

                <View style={styles.searchBarContainer}>
                    <Input
                        placeholder="Search product name..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        containerStyle={{ marginHorizontal: 0 }}
                        inputStyle={{ height: 44 }}
                        renderRightIcon={
                            searchQuery ? (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Icon name="close-circle" size={18} color={Theme.color.COLOR_MUTED_2} />
                                </TouchableOpacity>
                            ) : undefined
                        }
                    />
                </View>
            </View>

            {/* Live Search List */}
            {isFetching ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Theme.color.COLOR_PRIMARY_GREEN} />
                    <SmallText textStyles={styles.loaderText} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                        Searching products...
                    </SmallText>
                </View>
            ) : searchQuery.trim().length < 2 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="search-outline" size={48} color={Theme.color.COLOR_MUTED_2} />
                    <MediumText textStyles={styles.emptyTitle} size={4.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                        Search Halal Checks
                    </MediumText>
                    <SmallText textStyles={styles.emptyText} size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                        Type at least 2 characters to search for previously verified products.
                    </SmallText>
                </View>
            ) : results && results.length > 0 ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.scanCard}
                            onPress={() => handleResultPress(item)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.scanCardLeft}>
                                <View style={styles.scanThumbnail}>
                                    {item.front_image || item.back_image || item.ingredients_image ? (
                                        <Image source={{ uri: item.front_image || item.back_image || item.ingredients_image }} style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        <Icon name="fast-food-outline" size={18} color={Theme.color.COLOR_MUTED} />
                                    )}
                                </View>
                                <View style={styles.scanInfo}>
                                    <MediumText size={3.5} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} color={Theme.color.COLOR_INK} numberOfLines={1}>
                                        {item.product_name || 'Unknown Product'}
                                    </MediumText>
                                    <SmallText size={2.8} color={Theme.color.COLOR_MUTED}>
                                        Analyzed on {new Date(item.created_at).toLocaleDateString()}
                                    </SmallText>
                                </View>
                            </View>

                            {/* Status Badge */}
                            <View style={[
                                styles.statusBadge, 
                                { backgroundColor: getStatusBgColor(item.overall_status) }
                            ]}>
                                <SmallText 
                                    size={2.6} 
                                    fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD} 
                                    color={getStatusColor(item.overall_status)}
                                >
                                    {(item.overall_status || 'doubtful').toUpperCase()}
                                </SmallText>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon name="file-search-outline" size={48} color={Theme.color.COLOR_MUTED_2} />
                    <MediumText textStyles={styles.emptyTitle} size={4.2} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                        No Products Found
                    </MediumText>
                    <SmallText textStyles={styles.emptyText} size={3.2} fontFamily={Theme.fonts.FONT_NUNITO_REGULAR}>
                        We haven&apos;t verified &quot;{searchQuery}&quot; yet. You can scan it now to get a status verdict.
                    </SmallText>
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={handleScanNewProduct}
                        activeOpacity={0.8}
                    >
                        <Icon name="scan" size={18} color="#FFFFFF" />
                        <SmallText textStyles={styles.scanButtonText} size={3.4} fontFamily={Theme.fonts.FONT_NUNITO_EXTRABOLD}>
                            Scan New Product
                        </SmallText>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

export default Search;
