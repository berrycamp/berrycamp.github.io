import {Breadcrumbs, Link as MuiLink, Typography} from "@mui/material";
import Link from "next/link";
import {FC} from "react";

export const ChapterBreadcrumbs: FC<ChapterBreadcrumbsProps> = ({areaId, areaName, chapterName}) => (
  <Breadcrumbs sx={{marginTop: 1, marginBottom: 1}}>
    <Link passHref href={`/${areaId}`}>
      <MuiLink underline="always">
        {areaName}
      </MuiLink>
    </Link>
    <Typography color="text.primary">{chapterName}</Typography>
  </Breadcrumbs>
)

export interface ChapterBreadcrumbsProps {
  areaId: string;
  areaName: string;
  chapterName: string;
}