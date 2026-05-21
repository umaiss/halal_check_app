import { StyleSheet } from 'react-native';
import { height, width } from '../../utils/dimensions';
import Theme from '../../theme/theme';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    paddingVertical: height(1.7),
    width: '100%'
  },
  disableContainer: {
    backgroundColor: Theme.color.COLOR_MUTED_2,
  },
  primaryContainer: {
    backgroundColor: Theme.color.COLOR_PRIMARY_GREEN,
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderColor: Theme.color.COLOR_PRIMARY_GREEN,
    borderWidth: 1.5,
  },
  shadow: {
    ...Theme.shadows.sh_button,
  },
});

export default styles;