import {Box, BoxProps} from "@mui/material";
import {FC} from "react";

export const AspectBox: FC<AspectBoxProps> = ({aspectRatio, children, ...boxProps}) => (
  <Box {...boxProps} width="100%" position="relative" paddingBottom={aspectRatio ?? "56.25%"}>
    {children}
  </Box>
);

interface AspectBoxProps extends BoxProps {
  aspectRatio?: string;
}