import {Breadcrumbs as MuiBreadcrumbs, Link as MuiLink, Typography} from "@mui/material";
import Link from "next/link";
import {FC} from "react";

export interface BreadcrumbsProps {
  crumbs: Array<{name: string, href?: string}>;
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({crumbs}) => (
  <MuiBreadcrumbs separator="›" sx={{marginTop: 1, marginBottom: 1}}>
    {crumbs.map(({name, href}) => href ? (
      <Link key={name} passHref href={href}>
        <MuiLink underline="always">
          {name}
        </MuiLink>
      </Link>
    ) : (
      <Typography key={name} color="text.primary">{name}</Typography>
    ))}
  </MuiBreadcrumbs>
);