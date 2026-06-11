import { StyleSheet , Platform } from 'react-native';
import { height, width } from '../../utils/dimensions';
import Theme from '../../theme/theme';


const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.color.COLOR_BG,
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 110,
        paddingHorizontal: width(5),
    },
    // User header
    headerContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: height(1.5),
        paddingBottom: height(2),
        paddingTop: Platform.OS === 'ios' ? height(1.5) : height(2.5),
    },
    headerLeft: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    avatarBubble: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderColor: '#FFFFFF',
        borderRadius: width(6),
        borderWidth: 1.5,
        height: width(12),
        justifyContent: 'center',
        marginRight: width(3),
        width: width(12),
        ...Theme.shadows.sh_card,
    },
    avatarText: {
        color: '#FFFFFF',
        fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD,
    },
    welcomeText: {
        color: Theme.color.COLOR_MUTED,
    },
    userName: {
        color: Theme.color.COLOR_INK,
    },
    historyBtn: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#ECEFF1',
        borderRadius: width(5.5),
        borderWidth: 1,
        height: width(11),
        justifyContent: 'center',
        width: width(11),
        ...Theme.shadows.sh_card,
    },
    // Card Wrapper
    cardWrapper: {
        backgroundColor: '#FFFFFF',
        borderColor: '#ECEFF1',
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: height(2.5),
        padding: width(4.5),
        ...Theme.shadows.sh_card,
    },
    sectionLabel: {
        marginBottom: height(0.8),
    },
    sectionSubLabel: {
        color: Theme.color.COLOR_MUTED,
        marginBottom: height(2),
    },
    // Slot Grid
    slotRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: height(1.5),
        marginTop: height(1),
    },
    slotItem: {
        width: (width(100) - width(19)) / 3, // dynamically scale based on paddings
        height: ((width(100) - width(19)) / 3) * 1.33, // 3:4 aspect ratio
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    emptySlot: {
        backgroundColor: '#F7FAF8',
        borderColor: '#C5CCC9',
        borderStyle: 'dashed',
        borderWidth: 1.5,
    },
    filledSlot: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E8EFEA',
        borderWidth: 1.5,
        overflow: 'hidden',
    },
    slotThumbnail: {
        height: '100%',
        width: '100%',
    },
    deleteBadge: {
        alignItems: 'center',
        backgroundColor: '#E05353',
        borderColor: '#FFFFFF',
        borderRadius: 11,
        borderWidth: 1.5,
        elevation: 3,
        height: 22,
        justifyContent: 'center',
        position: 'absolute',
        right: -6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        top: -6,
        width: 22,
        zIndex: 10,
    },
    slotOverlay: {
        alignItems: 'center',
        backgroundColor: 'rgba(15, 20, 17, 0.6)',
        bottom: 0,
        left: 0,
        paddingVertical: 4,
        position: 'absolute',
        right: 0,
    },
    slotOverlayText: {
        color: '#FFFFFF',
    },
    slotIcon: {
        marginBottom: 6,
    },
    slotTitle: {
        color: Theme.color.COLOR_MUTED,
        textAlign: 'center',
    },
    checkmarkBadge: {
        backgroundColor: '#FFFFFF',
        borderRadius: 9,
        elevation: 2,
        left: 6,
        padding: 1,
        position: 'absolute',
        top: 6,
    },
    // Verify actions
    verifyBtnContainer: {
        marginTop: height(1),
    },
    verifyBtn: {
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 14,
        paddingVertical: height(1.8),
    },
    loaderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height(2),
    },
    loaderStatusText: {
        color: Theme.color.COLOR_PRIMARY_GREEN,
        marginTop: 10,
    },
    // Recent scans
    recentHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: height(1.5),
    },
    seeAllLink: {
        paddingVertical: 4,
    },
    recentScansList: {
        gap: 10,
    },
    scanCard: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#ECEFF1',
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: width(4),
        ...Theme.shadows.sh_card,
    },
    scanCardLeft: {
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
    },
    scanThumbnail: {
        alignItems: 'center',
        backgroundColor: '#F0F4F2',
        borderRadius: 8,
        height: width(10),
        justifyContent: 'center',
        marginRight: width(3),
        overflow: 'hidden',
        width: width(10),
    },
    scanInfo: {
        flex: 1,
    },
    scanTitle: {
        color: Theme.color.COLOR_INK,
        marginBottom: 2,
    },
    scanDate: {
        color: Theme.color.COLOR_MUTED,
    },
    statusBadge: {
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    emptyRecentContainer: {
        alignItems: 'center',
        paddingVertical: height(4),
    },
    emptyRecentText: {
        color: Theme.color.COLOR_MUTED,
        marginTop: 8,
    },
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderColor: '#ECEFF1',
        borderRadius: 14,
        borderWidth: 1,
        marginTop: 4,
        maxHeight: 200,
        overflow: 'hidden',
        ...Theme.shadows.sh_card,
        zIndex: 10,
    },
    suggestionItem: {
        alignItems: 'center',
        borderBottomColor: '#F4F6F5',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: width(4),
        paddingVertical: 12,
    },
    suggestionStatusBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    scanButtonBig: {
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: Theme.color.COLOR_PRIMARY_GREEN,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
        marginTop: 4,
        marginBottom: 10,
    },
    scanButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    scanIconContainer: {
        marginRight: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 10,
        padding: 6,
    },
    scanTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    searchDivider: {
        height: 1,
        backgroundColor: '#F4F6F5',
        marginVertical: 18,
    },
    searchSection: {
        marginTop: 2,
    }
});

export default styles;