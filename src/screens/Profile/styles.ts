import { StyleSheet, Platform } from 'react-native';
import Theme from '../../theme/theme';
import { height, width } from '../../utils/dimensions';

export const styles = StyleSheet.create({
    avatarBubble: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: width(7),
        height: width(14),
        justifyContent: 'center',
        width: width(14),
    },
    avatarText: {
        color: Theme.color.COLOR_PRIMARY_GREEN,
        lineHeight: width(8),
    },
    container: {
        backgroundColor: Theme.color.COLOR_BG,
        flex: 1,
    },
    divider: {
        backgroundColor: Theme.color.COLOR_BORDER,
        height: 1,
    },
    groupCard: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_BORDER,
        borderRadius: 22,
        borderWidth: 1,
        overflow: 'hidden',
        paddingHorizontal: width(4.5),
    },
    groupContainer: {
        marginBottom: height(3),
    },
    groupTitle: {
        color: Theme.color.COLOR_MUTED_2,
        letterSpacing: 0.8,
        marginBottom: 8,
        paddingLeft: 4,
    },
    iconWrapper: {
        alignItems: 'center',
        borderRadius: 10,
        height: 32,
        justifyContent: 'center',
        width: 32,
    },
    rowLabel: {
        color: Theme.color.COLOR_INK,
    },
    rowLabelContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    screenHeader: {
        // backgroundColor: Theme.color.COLOR_WHITE,
        borderBottomColor: Theme.color.COLOR_BORDER,
        borderBottomWidth: 1,
        paddingBottom: height(1.5),
        paddingHorizontal: width(5),
        paddingTop: Platform.OS === 'ios' ? height(3) : height(2.5),
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: width(5),
        paddingBottom: 110,
    },
    settingsLinkRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    settingsRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_BORDER,
        borderRadius: 20,
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        paddingVertical: height(1.8),
    },
    statLabel: {
        color: Theme.color.COLOR_MUTED,
        letterSpacing: 0.4,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: width(3),
        justifyContent: 'space-between',
        marginBottom: height(3.5),
    },
    userCard: {
        backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
        borderRadius: 24,
        marginBottom: height(2.5),
        padding: width(5),
    },
    userCardContent: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 16,
    },
    userEmail: {
        color: 'rgba(255, 255, 255, 0.75)',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: Theme.color.COLOR_WHITE,
        marginBottom: 2,
    },
});
