import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types/RootParamList';
import { SmallText } from '../../components/text';
import Theme from '../../theme/theme';
import { useHalalCheckMutation } from '../../redux/authApi/authApi';
import { HalalCheckResponse, IngredientStatus } from '../../redux/services/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { scanHistoryStorage } from '../../utils/scanHistoryStorage';

type IngredientsResultRouteProp = RouteProp<RootStackParamList, 'IngredientsResult'>;
type IngredientsResultNavigationProp = NativeStackNavigationProp<RootStackParamList, 'IngredientsResult'>;

function IngredientsResult() {
    const navigation = useNavigation<IngredientsResultNavigationProp>();
    const route = useRoute<IngredientsResultRouteProp>();
    const { ingredients, imageUri, halalCheckResult } = route.params;

    // API hook for halal check
    const [halalCheck, { data: halalCheckResultFromAPI, isLoading: isCheckingHalal, error: halalCheckError }] = useHalalCheckMutation();

    // State for halal check results
    const [halalStatus, setHalalStatus] = useState<HalalCheckResponse | null>(null);

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
    const formatDataForAPI = (text: string) => {
        // Clean the text
        const cleanedText = text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, ' ') // Replace newlines with space
            .trim(); // Remove leading/trailing whitespace

        // Prepare data in a format suitable for API
        const apiData = {
            text: cleanedText,
        };

        return apiData;
    };

    // Handle halal check API call
    const handleHalalCheck = async () => {
        try {
            // Format the data before sending
            const formattedData = formatDataForAPI(ingredients);

            console.log('Sending data to API:', JSON.stringify(formattedData, null, 2));

            // Send formatted data to API
            const result = await halalCheck(formattedData).unwrap();

            console.log('Halal check API response:', result);
            setHalalStatus(result);

            // Save to AsyncStorage scan history (only for new scans, not from history)
            try {
                await scanHistoryStorage.addScan({
                    ingredients,
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
            >
                {/* Captured Image with Enhanced Design */}
                {imageUri && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.capturedImage}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                            <Icon name="camera" size={20} color={Theme.color.COLOR_WHITE} />
                            <SmallText textStyles={styles.imageLabel} size={2.5}>
                                Scanned Image
                            </SmallText>
                        </View>
                    </View>
                )}

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
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
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
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        color: Theme.color.COLOR_BLUE,
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
        padding: 20,
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
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
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    imageLabel: {
        color: Theme.color.COLOR_WHITE,
        marginLeft: 6,
    },
    halalCheckContainer: {
        marginBottom: 24,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    loadingText: {
        marginTop: 16,
        color: Theme.color.COLOR_TEXT,
    },
    loadingSubtext: {
        marginTop: 8,
        color: Theme.color.COLOT_SUBTEXT,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    errorTitle: {
        color: Theme.color.COLOR_RED,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    errorText: {
        color: Theme.color.COLOT_SUBTEXT,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
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
        marginBottom: 16,
    },
    overallStatusCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
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
        marginBottom: 16,
    },
    statusIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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
        fontSize: 28,
        lineHeight: 36,
    },
    reasoningContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: 16,
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
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
        padding: 18,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    ingredientStatusHeader: {
        marginBottom: 12,
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
        paddingTop: 12,
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
        marginTop: 24,
        marginBottom: 20,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 32,
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
});

export default IngredientsResult;
