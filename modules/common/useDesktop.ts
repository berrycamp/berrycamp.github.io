import {useMediaQuery, useTheme} from "@mui/material";

/**
 * Check if in desktop mode.
 */
export const useDesktop = (): {isDesktop: boolean} => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  return {isDesktop};
}