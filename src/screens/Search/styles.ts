import { StyleSheet, Platform } from 'react-native';
import Theme from '../../theme/theme';
import { height, width } from '../../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.color.COLOR_BG,
        flex: 1,
    },
    header: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderBottomColor: Theme.color.COLOR_BORDER,
        borderBottomWidth: 1,
        flexDirection: 'row',
        paddingBottom: height(1.5),
        paddingHorizontal: width(4),
        paddingTop: Platform.OS === 'ios' ? height(6) : height(2.5),
        gap: 8,
    },
    backButton: {
        alignItems: 'center',
        borderRadius: width(5.5),
        height: width(11),
        justifyContent: 'center',
        width: width(11),
    },
    searchBarContainer: {
        flex: 1,
    },
    listContent: {
        padding: width(4.5),
        paddingBottom: height(6),
        gap: 12,
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
    statusBadge: {
        alignItems: 'center',
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: height(8),
        paddingHorizontal: width(10),
        justifyContent: 'center',
    },
    emptyTitle: {
        color: Theme.color.COLOR_INK,
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        color: Theme.color.COLOR_MUTED,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
    },
    scanButton: {
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 14,
        paddingHorizontal: 24,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...Theme.shadows.sh_button,
    },
    scanButtonText: {
        color: '#FFFFFF',
    },
    loaderContainer: {
        alignItems: 'center',
        paddingVertical: height(6),
    },
    loaderText: {
        color: Theme.color.COLOR_PRIMARY_GREEN,
        marginTop: 10,
    },
});

export default styles;
