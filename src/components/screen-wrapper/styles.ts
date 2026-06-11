import { StyleSheet } from 'react-native';
import { height, width } from '../../utils/dimensions';
import Theme from '../../theme/theme';

const styles = StyleSheet.create({
  backText: {
    color: Theme.color.COLOR_TEXT,
    fontSize: 20,
  },

  container: {
    backgroundColor: Theme.color.TRANSPARENT,
    flex: 1,

  },
  contentContainer: {
    // flex: 1,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: Theme.color.COLOR_WHITE,
    justifyContent: 'center',
    padding: width(5),
  },
  errorText: {
    color: Theme.color.COLOR_RED,
    fontSize: 16,
    marginBottom: height(1),
    textAlign: 'center',
  },

  headerContainer: {
    alignItems: 'center',
    backgroundColor: Theme.color.COLOR_WHITE,
    borderBottomColor: Theme.color.COLOR_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width(5),
    paddingTop: height(6),
  },
  headerTitle: {
    paddingBottom: height(1),
  },
  leftIcon: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingBottom: height(1),
    width: width(10),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
  },
  offlineBanner: {
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },

  offlineText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  retryButton: {
    backgroundColor: Theme.color.COLOR_BLUE,
    borderRadius: 8,
    paddingHorizontal: width(5),
    paddingVertical: height(1),
  },

  retryText: {
    color: Theme.color.COLOR_WHITE,
    fontSize: 14,
  },

  rightIcon: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: height(1),
    width: width(10),
  },

  scroll: {
    flex: 1,
    paddingBottom: height(1.5),
  },

});
export default styles;
