import {useMediaQuery, useTheme} from "@mui/material";
import {useEffect, useState} from 'react';

/**
 * Check if in desktop mode.
 */
export const useMobile = (): {isLargeScreen: boolean, isMobile: boolean} => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const theme = useTheme();
  const isLargeScreen: boolean = useMediaQuery(theme.breakpoints.up('sm'));

  useEffect(() => {
    const mobile: RegExp[] = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
    ];
    setIsMobile(mobile.some(regex => navigator.userAgent.match(regex)));
  }, []);

  return {isLargeScreen, isMobile};
}