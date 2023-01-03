import {NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Button} from "@mui/material";
import Link from "next/link";
import {FC} from "react";
import {ChapterNav} from ".";

export const HeaderNav: FC<HeaderNavProps> = ({areaId, prevChapter, nextChapter}) => (
  <Box display="flex" gap={1} marginTop={1}>
    <Box width="100%">
      {prevChapter && (
        <Link passHref href={`/${areaId}/${prevChapter.id}`} legacyBehavior>
          <Button
            size="small"
            variant="outlined"
            startIcon={<NavigateBefore />}
            aria-label={`Go to previous chapter ${prevChapter.name}`}
            sx={{width: "100%"}}
          >
            {prevChapter.name}
          </Button>
        </Link>
      )}
    </Box>
    <Box width="100%">
      {nextChapter && (
        <Link passHref href={`/${areaId}/${nextChapter.id}`} legacyBehavior>
          <Button
            size="small"
            variant="outlined"
            endIcon={<NavigateNext />}
            aria-label={`Go to previous chapter ${nextChapter.name}`}
            sx={{width: "100%"}}
          >
            {nextChapter.name}
          </Button>
        </Link>
      )}
    </Box>
  </Box>
);

export interface HeaderNavProps {
  areaId: string;
  prevChapter?: ChapterNav;
  nextChapter?: ChapterNav;
}