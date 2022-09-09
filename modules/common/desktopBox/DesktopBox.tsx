import {Box, BoxProps} from "@mui/material";
import {forwardRef} from "react";

/**
 * Display a boxed component in desktop mode only.
 */
export const DesktopBox = forwardRef<typeof Box, BoxProps>(({ref, children, ...other}) => {
  return (
    <Box {...ref && {ref}} {...other} sx={{...other.sx, display: {xs: "none", sm: "flex"}}}>
      {children}
    </Box>
  );
});