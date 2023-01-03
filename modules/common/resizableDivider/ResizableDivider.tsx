import {Box, Divider, DividerProps} from '@mui/material';
import {forwardRef, ForwardRefExoticComponent} from 'react';

export const ResizableDivider: ForwardRefExoticComponent<DividerProps> = forwardRef(({
  onMouseDown,
  onTouchStart,
  ...other
}, ref) => {
  const isVertical: boolean = other.orientation === "vertical";

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
        ...(isVertical ? {
          cursor: "col-resize",
          width: 24,
        } : {
          cursor: "row-resize",
          height: 24,
        }),
        "&.MuiDivider-root::before": {
          top: 0,
          ...(isVertical && {marginBottom: "-16px"})
        },
        "&.MuiDivider-root::after": {
          top: 0,
          ...(isVertical && {marginTop: "-10px"})
        },
        "& .MuiDivider-wrapper": {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isVertical ? "1.4rem" : "1.2rem",
          userSelect: "none",
        },
      }}
    >
      <Box
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        sx={{
          touchAction: "none",
          position: "absolute",
          ...(other.orientation === "vertical" ? {
            top: 0,
            bottom: 0,
            left: -8,
            right: -8,
          } : {
            top: -8,
            bottom: -8,
            left: 0,
            right: 0,
          }), 
        }}
      />
      {other.orientation === "vertical" ? "↔" : "↕"}
    </Divider>
  );
});
