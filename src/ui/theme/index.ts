import { extendTheme } from 'native-base';
import { colors, fonts } from './tokens';

export const appTheme = extendTheme({
  colors,
  fonts,
  components: {
    Button: { defaultProps: { rounded: '2xl' } },
    Input: { defaultProps: { rounded: 'xl', variant: 'unstyled' } }
  },
  config: { initialColorMode: 'light' }
});
export type AppTheme = typeof appTheme;
