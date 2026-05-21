import { StyleSheet } from 'react-native';
import Theme from '../../theme/theme';
import { height, width } from '../../utils/dimensions';

const GRID_ITEM_WIDTH = (width(100) - width(12.8) - width(4.2)) / 2; // (Screen width - padding - gap) / 2

export const styles = StyleSheet.create({
    backButton: {
        marginRight: width(4.2),
        padding: 4,
    },
    buttonText: {
        marginLeft: 4,
    },
    container: {
        backgroundColor: Theme.color.COLOR_WHITE,
        flex: 1,
    },
    content: {
        paddingBottom: height(12),
        paddingHorizontal: width(6.4),
    },
    description: {
        lineHeight: 20,
        marginBottom: height(3),
    },
    editIconContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 6,
        position: 'absolute',
        right: 8,
        top: 8,
    },
    footer: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderTopColor: Theme.color.COLOR_STROKE,
        borderTopWidth: 1,
        bottom: 0,
        left: 0,
        padding: width(6.4),
        paddingBottom: height(5),
        position: 'absolute',
        right: 0,
    },
    fullWidthContainer: {
        marginBottom: height(2),
    },
    gridContainer: {
        flexDirection: 'row',
        gap: width(4.2),
        marginBottom: height(2),
    },
    header: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_WHITE,
        flexDirection: 'row',
        paddingBottom: height(2.5),
        paddingHorizontal: width(6.4),
        paddingTop: height(7.4),
    },
    imageButton: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderColor: Theme.color.COLOR_STROKE,
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 2,
        flex: 1,
        height: height(20),
        overflow: 'hidden',
        width: '100%',
    },
    placeholderContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        padding: width(4.2),
    },
    placeholderText: {
        marginTop: height(1),
        textAlign: 'center',
    },
    previewImage: {
        height: '100%',
        resizeMode: 'cover',
        width: '100%',
    },
    processButton: {
        alignItems: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        borderRadius: 16,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        paddingVertical: height(2),
    },
    processButtonDisabled: {
        backgroundColor: Theme.color.COLOT_SUBTEXT,
        opacity: 0.7,
    },
});
