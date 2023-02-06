import {NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Button, ButtonProps, Typography} from "@mui/material";
import Link from "next/link";
import {FC} from "react";

const btnProps: ButtonProps = {
  fullWidth: true,
  size: "small",
  variant: "outlined",
}

export const HeaderNav: FC<HeaderNavProps> = ({prev, next}) => (
  <Box display="flex" gap={1} mt={1} mb={1}>
    <Box width="100%" minWidth={0}>
      {prev && (
        <Link passHref href={prev.link}>
          <Button
            {...btnProps}
            startIcon={<NavigateBefore />}
            aria-label={`Go to previous chapter ${prev.label}`}
          >
            <Typography noWrap variant="button">{prev.label}</Typography>
          </Button>
        </Link>
      )}
    </Box>
    <Box width="100%" minWidth={0}>
      {next && (
        <Link passHref href={next.link}>
          <Button
            {...btnProps}
            endIcon={<NavigateNext />}
            aria-label={`Go to previous chapter ${next.label}`}
          >
             <Typography noWrap variant="button">{next.label}</Typography>
            
          </Button>
        </Link>
      )}
    </Box>
  </Box>
);

export interface HeaderNavLink {
  label: string;
  link: string;
}

export interface HeaderNavProps {
  prev?: HeaderNavLink;
  next?: HeaderNavLink
}