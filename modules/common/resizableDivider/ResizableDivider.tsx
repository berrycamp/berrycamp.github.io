import {Divider, DividerProps} from '@mui/material';
import {forwardRef, ForwardRefExoticComponent} from 'react';

export const ResizableDivider: ForwardRefExoticComponent<DividerProps> = forwardRef((props, ref) => {
  return (
    <Divider
      ref={ref}
      {...props}
      color="primary"
      variant="fullWidth"
      sx={{
        ...props.sx,
        touchAction: "none",
        color: "primary.main",
        ...props.orientation === "vertical" ? {
          cursor: "col-resize",
        } : {
          cursor: "row-resize",
        },
        "&.MuiDivider-root::before": {
          top: 0,
        },
        "&.MuiDivider-root::after": {
          top: 0,
        }
      }}
    >
      {props.orientation === "vertical" ? "+" : "+"}
    </Divider>
  );
});