import { StyleSheet } from 'react-native';
import { height, width } from '../../utils/dimensions';
import Theme from '../../theme/theme';

const styles = StyleSheet.create({
    container: {
        backgroundColor: Theme.color.COLOR_WHITE,
        marginBottom: height(2),
        overflow: "hidden",
        width: '100%',


    },
    input: {
        backgroundColor: 'transparent',
        color: Theme.color.COLOR_TEXT,
        fontSize: width(4.2),
        height: '100%',
        marginLeft: height(1),
        width: '93%'
    },
    inputContainer: {
        alignItems: "center",
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_STROKE,
        borderRadius: width(100),
        borderWidth: width(0.3),
        color: Theme.color.COLOR_TEXT,
        flexDirection: "row",
        height: height(6.5),
        justifyContent: "space-between",
        overflow: "hidden",
        paddingLeft: width(5),
        paddingRight: width(2)
    },

});

export default styles;