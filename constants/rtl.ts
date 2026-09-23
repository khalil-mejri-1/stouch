import { StyleSheet } from 'react-native';

export const rtlStyles = StyleSheet.create({
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  row: {
    flexDirection: 'row',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  infoSpacing: {
    alignItems: 'flex-start',
    marginLeft: 14,
    marginRight: 0,
  },
  bold700: {
    fontWeight: '700',
  },
});
