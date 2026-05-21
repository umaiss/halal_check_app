import { StyleSheet } from 'react-native';
import { height, width } from '../../utils/dimensions';
import Theme from '../../theme/theme';

const styles = StyleSheet.create({
    container: {
        marginBottom: height(2),
        width: '100%',
    },
    input: {
        backgroundColor: 'transparent',
        flex: 1,
        fontFamily: Theme.fonts.FONT_NUNITO_REGULAR,
        fontSize: width(4),
        height: '100%',
        marginLeft: width(2),
    },
    inputContainer: {
        alignItems: "center",
        borderRadius: 14,
        borderWidth: 1.5,
        flexDirection: "row",
        height: height(6.5),
        paddingHorizontal: width(4),
    },
});

export default styles;