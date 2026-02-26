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
        // paddingHorizontal: width(5),
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: height(3),
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: height(4),
    },
    inputContainer: {
        marginBottom: height(2),
        marginHorizontal: width(4),
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
