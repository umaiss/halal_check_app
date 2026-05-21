import { StyleSheet } from 'react-native';
import { height, width } from '../../utils/dimensions';
import Theme from '../../theme/theme';

const styles = StyleSheet.create({
    buttonContainer: {
        marginBottom: height(2),
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
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: height(3.5),
        zIndex: 2,
    },
    footerLink: {
        color: '#FFFFFF',
        fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 24,
        borderWidth: 1.5,
        paddingHorizontal: width(6),
        paddingVertical: height(3.5),
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
        marginBottom: height(3),
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
    subTitle: {
        color: 'rgba(255, 255, 255, 0.65)',
        textAlign: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontFamily: Theme.fonts.FONT_NUNITO_EXTRABOLD,
        fontSize: width(7.5),
        marginBottom: height(0.8),
    }
});

export default styles;
