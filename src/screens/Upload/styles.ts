import { StyleSheet } from 'react-native';
import Theme from '../../theme/theme';
import { height, width } from '../../utils/dimensions';

const GRID_ITEM_WIDTH = (width(100) - width(12.8) - width(4.2)) / 2; // (Screen width - padding - gap) / 2

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width(6.4),
        paddingTop: height(7.4),
        paddingBottom: height(2.5),
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    backButton: {
        marginRight: width(4.2),
        padding: 4,
    },
    content: {
        paddingHorizontal: width(6.4),
        paddingBottom: height(12),
    },
    description: {
        marginBottom: height(3),
        lineHeight: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        gap: width(4.2),
        marginBottom: height(2),
    },
    fullWidthContainer: {
        marginBottom: height(2),
    },
    imageButton: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Theme.color.COLOR_STROKE,
        borderStyle: 'dashed',
        overflow: 'hidden',
        height: height(20),
        width: '100%',
        flex: 1,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: width(4.2),
    },
    placeholderText: {
        textAlign: 'center',
        marginTop: height(1),
    },
    editIconContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 6,
        borderRadius: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: width(6.4),
        paddingBottom: height(5),
        backgroundColor: Theme.color.COLOR_WHITE,
        borderTopWidth: 1,
        borderTopColor: Theme.color.COLOR_STROKE,
    },
    processButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        paddingVertical: height(2),
        borderRadius: 16,
        gap: 8,
    },
    processButtonDisabled: {
        backgroundColor: Theme.color.COLOT_SUBTEXT,
        opacity: 0.7,
    },
    buttonText: {
        marginLeft: 4,
    },
});
