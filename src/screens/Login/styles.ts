import { StyleSheet } from 'react-native';
import { height, width } from '../../utils/dimensions';
import Theme from '../../theme/theme';

const styles = StyleSheet.create({
    buttonContainer: {
        marginVertical: height(2),
        marginHorizontal: width(4),
    },
    container: {
        backgroundColor: Theme.color.BACKGROUND_COLOR,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: width(5),
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginBottom: height(3),
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: height(4),
    },
    inputContainer: {
        marginBottom: height(2),
        marginHorizontal: width(4),
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: height(4),
    },
    socialButton: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: width(6),
        elevation: 5,
        height: width(12),
        justifyContent: 'center',
        shadowColor: Theme.color.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        width: width(12),
    },
    socialButtonsRow: {
        flexDirection: 'row',
        gap: width(5),
        justifyContent: 'center',
        marginTop: height(2),
    },
    socialLoginContainer: {
        alignItems: 'center',
        marginTop: height(4),
    },
    subTitle: {
        textAlign: 'center',
    },
    title: {
        marginBottom: height(1),
    },
    icon: {
        right: width(2),
    }
});

export default styles;
