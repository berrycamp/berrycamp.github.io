import {Box, Divider, DividerProps} from '@mui/material';
import {forwardRef, ForwardRefExoticComponent} from 'react';

export const ResizableDivider: ForwardRefExoticComponent<DividerProps> = forwardRef(({
  onMouseDown,
  onTouchStart,
  ...other
}, ref) => {
  return (
    <Divider
      ref={ref}
      {...other}
      flexItem
      color="primary"
      variant="fullWidth"

      sx={{
        ...other.sx,
        position: "relative",
        color: "primary.main",
        ...other.orientation === "vertical" ? {
          cursor: "col-resize",
          width: 36,
        } : {
          cursor: "row-resize",
          height: 36,
        },
        "&.MuiDivider-root::before": {
          top: 0,
        },
        "&.MuiDivider-root::after": {
          top: 0,
        },
        "& .MuiDivider-wrapper": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: other.orientation === "vertical" ? "1.4rem" : "1.2rem",
          userSelect: "none",
        },
      }}
    >
      <Box
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        sx={{
          position: "absolute",
          ...other.orientation === "vertical" ? {
            top: 0,
            bottom: 0,
            left: -8,
            right: -8,
          } : {
            top: -8,
            bottom: -8,
            left: 0,
            right: 0,
          }, 
        }}
      />
      {other.orientation === "vertical" ? "↔" : "↕"}
    </Divider>
  );
});
