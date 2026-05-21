import { StyleSheet } from 'react-native';
import { height, width } from '../../utils/dimensions';
import Theme from '../../theme/theme';

const styles = StyleSheet.create({
    buttonContainer: {
        marginBottom: height(3),
        marginTop: height(1.5),
    },
    buttonStyle: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: height(1.8),
    },
    container: {
        backgroundColor: '#074330', // Premium dark emerald green
        flex: 1,
        justifyContent: 'center',
    },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginVertical: height(1.5),
    },
    forgotPasswordText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: Theme.fonts.FONT_NUNITO_MEDIUM,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 24,
        borderWidth: 1.5,
        paddingHorizontal: width(6),
        paddingVertical: height(4),
        ...Theme.shadows.sh_card,
        zIndex: 1,
    },
    glowBlob1: {
        backgroundColor: 'rgba(46, 168, 115, 0.15)',
        borderRadius: width(40),
        height: width(80),
        left: -width(20),
        position: 'absolute',
        top: -height(10),
        width: width(80),
        zIndex: 0,
    },
    glowBlob2: {
        backgroundColor: 'rgba(14, 121, 85, 0.18)',
        borderRadius: width(45),
        bottom: -height(10),
        height: width(90),
        position: 'absolute',
        right: -width(20),
        width: width(90),
        zIndex: 0,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: height(3.5),
    },
    icon: {
        marginRight: width(1),
    },
    inputContainer: {
        marginBottom: height(0.5),
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: width(6),
        paddingVertical: height(4),
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: height(4.5),
        zIndex: 2,
    },
    signupLink: {
        color: '#FFFFFF',
        fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD,
    },
    signupText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    socialButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 14,
        borderWidth: 1.5,
        height: height(6.5),
        justifyContent: 'center',
        width: width(25),
    },
    socialButtonsRow: {
        flexDirection: 'row',
        gap: width(6),
        justifyContent: 'center',
    },
    socialDividerText: {
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: height(2),
    },
    socialLoginContainer: {
        alignItems: 'center',
        marginTop: height(1),
    },
    subTitle: {
        color: 'rgba(255, 255, 255, 0.65)',
        textAlign: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD,
        fontSize: width(7.5),
        marginBottom: height(1),
    }
});

export default styles;
