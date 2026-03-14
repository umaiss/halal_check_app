import { StyleSheet } from 'react-native';
import Theme from '../../theme/theme';
import { height, width } from '../../utils/dimensions';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.color.BACKGROUND_COLOR,
    },
    header: {
        paddingTop: height(8),
        paddingHorizontal: width(6),
        paddingBottom: height(4),
        alignItems: 'center',
    },
    avatarContainer: {
        width: width(30),
        height: width(30),
        borderRadius: width(15),
        backgroundColor: `${Theme.color.COLOR_BLUE}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: height(2),
        borderWidth: 2,
        borderColor: Theme.color.COLOR_BLUE,
    },
    avatarPlaceholder: {
        fontSize: width(12),
        color: Theme.color.COLOR_BLUE,
        fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD,
    },
    userName: {
        marginBottom: 4,
    },
    userEmail: {
        marginBottom: height(4),
    },
    content: {
        flex: 1,
        paddingHorizontal: width(6),
    },
    section: {
        marginBottom: height(6),
    },
    logoutButton: {
        backgroundColor: `${Theme.color.COLOR_RED}10`,
        borderColor: Theme.color.COLOR_RED,
        borderWidth: 1,
        marginTop: height(2),
    },
    logoutText: {
        color: Theme.color.COLOR_RED,
    }
});
