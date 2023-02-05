import {Map} from "@mui/icons-material";
import {Box, Button, List, ListItem, ListItemButton, Typography} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import {FC} from "react";
import {pluralize} from "../common/pluralize";
import {ChapterViewItemProps, ChapterViewProps} from "./ChapterGridView";

export const ChapterListView: FC<ChapterViewProps> = ({sides}) => {
  return (
    <List disablePadding sx={{pb: 1}}>
      {sides.map((side) => <ChapterListViewItem {...side} key={side.name}/>)}
    </List>
  );
};

export const ChapterListViewItem: FC<ChapterViewItemProps> = ({name, roomCount, href, src}) => {
  return (
    <ListItem
      disableGutters
      disablePadding
      secondaryAction={
        <Box display="flex" alignItems="center" gap={1}>
          <Typography component="div" color="text.secondary" marginRight={0.5}>{pluralize(roomCount, "room")}</Typography>
          <Link passHref href={`/map${href}`}>
            <Button variant="contained" endIcon={<Map/>} size="medium">Map</Button>
          </Link>
        </Box>
      }
      
    >
      <Link passHref href={href}>
        <ListItemButton sx={{padding: 0, marginTop: 0.5, marginBottom: 0.5}}>
          <Image
            unoptimized
            src={src}
            alt={`Image of side ${name}`}
            width={80}
            height={45}
          />
          <Typography component="div" marginLeft={2}>{name}</Typography>
        </ListItemButton>
      </Link>
    </ListItem>
  );
};
