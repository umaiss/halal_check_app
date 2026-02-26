import { StyleSheet, Dimensions } from 'react-native';
import Theme from '../../theme/theme';

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 48 - 16) / 2; // (Screen width - padding - gap) / 2

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: Theme.color.COLOR_WHITE,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    description: {
        marginBottom: 24,
        lineHeight: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    fullWidthContainer: {
        marginBottom: 16,
    },
    imageButton: {
        backgroundColor: Theme.color.COLOR_WHITE,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Theme.color.COLOR_STROKE,
        borderStyle: 'dashed',
        overflow: 'hidden',
        height: 160,
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
        padding: 16,
    },
    placeholderText: {
        textAlign: 'center',
        marginTop: 8,
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
        padding: 24,
        paddingBottom: 40,
        backgroundColor: Theme.color.COLOR_WHITE,
        borderTopWidth: 1,
        borderTopColor: Theme.color.COLOR_STROKE,
    },
    processButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Theme.color.COLOR_BLUE,
        paddingVertical: 16,
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
