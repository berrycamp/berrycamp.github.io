import {Fullscreen, Info, Launch, NavigateBefore, NavigateNext} from "@mui/icons-material";
import {Box, Breadcrumbs, Button, Container, Dialog, Divider, Link as MuiLink, styled, Theme, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery, useTheme} from "@mui/material";
import {Area, BoundingBox, Canvas, Chapter, Checkpoint, Room, Side} from "logic/data/dataTypes";
import {VALID_AREAS} from "logic/data/validAreas";
import {fetchArea, fetchChapter, fetchSide} from "logic/fetch/dataApi";
import {getCampImageUrl} from "logic/fetch/image";
import {useCampContext} from "logic/provide/CampContext";
import {CampCanvas, CanvasRoom} from "modules/canvas/CampCanvas";
import {AspectBox} from "modules/common/aspectBox/AspectBox";
import {CampHead} from "modules/head/CampHead";
import {GetStaticPaths, GetStaticProps} from "next";
import NextImage from "next/image";
import Link from "next/link";
import {NextRouter, useRouter} from "next/router";
import {CampPage} from "pages/_app";
import {ParsedUrlQuery} from "querystring";
import {FC, Fragment, MouseEvent, useEffect, useState} from "react";

type IMAGE_VIEW = "preview" | "room" | "checkpoint" | "level";

const RoomPage: CampPage<RoomProps> = ({
  area,
  chapter,
  side,
  checkpoint,
  room,
  nextRoom,
  prevRoom,
}) => {
  const {settings} = useCampContext();
  const router: NextRouter = useRouter();

  const [rooms, setRooms] = useState<CanvasRoom[]>([]);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | undefined>();

  const [imageView, setImageView] = useState<IMAGE_VIEW>("preview");
  const [imageOpen, setImageOpen] = useState<boolean>(false);
  const theme: Theme = useTheme();
  const isUpMdWidth = useMediaQuery(theme.breakpoints.up('md'));

  const previewImage: string = `${area.id}/previews/${chapter.id}/${side.id}/${room.debugId}`;

  /**
   * Send a request to open the room in Everest.
   */
  const handleOpenRoom = async (): Promise<void> => {
    try {
      const port: number = settings.port ?? 32270;
      const baseUrl: string = `http://localhost:${port}`;

      await fetch(`${baseUrl}/tp${room.teleportParams}`, {mode: "no-cors"});
      await fetch(`${baseUrl}/focus`);
    } catch (e) {
      // Do nothing.
    }
  }

  /**
   * Update the image view.
   */
  const handleViewChange = (_: MouseEvent, value: IMAGE_VIEW): void => {
    setImageView(value);
    
    switch(value) {
      case "preview": {
        setRooms([]);
        setBoundingBox(undefined);
        break;
      };
      case "room": {
        setRooms([{position: room.canvas.position, image: `${area.id}/rooms/${chapter.id}/${side.id}/${room.debugId}`}])
        setBoundingBox(room.canvas.boundingBox);
        break;
      };
      case "checkpoint": {
        setRooms(checkpoint.rooms)
        setBoundingBox(checkpoint.boundingBox);
        break;
      };
      case "level": {
        setRooms(side.rooms)
        setBoundingBox(side.boundingBox);
        break;
      };
    }
  }

  /**
   * Listen for left and right presses to navigate rooms.
   */
  useEffect(() => {
    const listener = (event: WindowEventMap["keydown"]) => {
      if (event.key === "ArrowLeft" && prevRoom?.link) {
        router.push(prevRoom.link);
      } else if (event.key === "ArrowRight" && nextRoom?.link) {
        router.push(nextRoom.link);
      }
    }

    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [nextRoom?.link, prevRoom?.link, router])

  const isASide: boolean = side.name === "A";

  return (
    <Fragment>
      <CampHead
        title={`${room.name} (${room.debugId})`}
        description={`${area.name} - ${chapter.name} - ${side.name} side - ${checkpoint.name}`}
        image={previewImage}
      />
      <Container maxWidth="md">
        <Breadcrumbs separator="›" sx={{marginTop: 2, marginBottom: 2}}>
          <Link passHref href={area.link}>
            <MuiLink underline="always">
              {area.name}
            </MuiLink>
          </Link>
          <Link passHref href={chapter.link}>
            <MuiLink underline="always">
              {chapter.name}
            </MuiLink>
          </Link>
          <Typography color="text.secondary">{side.name}</Typography>
          <Typography color="text.secondary">{checkpoint.name}</Typography>
          <Typography color="text.primary">{room.name} ({room.debugId})</Typography>
        </Breadcrumbs>
          {imageView === "preview" ? (
            <Dialog fullWidth maxWidth="xl" open={imageOpen} onClose={() => setImageOpen(false)} onClick={() => setImageOpen(false)}>
              <ImageView image={previewImage} roomName={room.name ?? room.debugId}/>
            </Dialog>
          ) : boundingBox && (
            <Dialog fullWidth maxWidth="xl" open={imageOpen} onClose={() => setImageOpen(false)}>
              <Box overflow="hidden">
                <CampCanvas rooms={rooms} boundingBox={boundingBox} />
              </Box>
            </Dialog>
          )}
        {imageView === "preview" ? (
          <ImageView image={previewImage} roomName={room.name ?? room.debugId} onClick={() => isUpMdWidth && setImageOpen(true)}/>
        ) : boundingBox && (
          <CampCanvas rooms={rooms} boundingBox={boundingBox}/>
        )}
        <Box marginBottom={2} display="flex">
          <StyledToggleButtonGroup fullWidth exclusive size="small" value={imageView} onChange={handleViewChange}>
            <ToggleButton value="preview">Preview</ToggleButton>
            <ToggleButton value="room">Room</ToggleButton>
            <ToggleButton value="checkpoint">Checkpoint</ToggleButton>
            <ToggleButton value="level">Level</ToggleButton>
          </StyledToggleButtonGroup>
          <StyledToggleButtonGroup>
            <ToggleButton value={false} size="small" onClick={() => setImageOpen(true)}>
              <Fullscreen />
            </ToggleButton>
          </StyledToggleButtonGroup>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography component="div" variant="h4">{room.name}</Typography>
          <Tooltip enterDelay={750} title={isASide ? "Teleport to room if Everest is installed and running" : "May not work for B and C sides due to Everest bug"}>
            <Button
              variant="contained"
              color={isASide ? "primary" : "warning"}
              endIcon={isASide ? <Launch /> : <Info />}
              onClick={handleOpenRoom}
              aria-label="Teleports to the current room in Celeste"
              sx={{
                display: {
                  xs: "none",
                  sm: "inline-flex",
                }
              }}
            >
              Teleport
            </Button>
          </Tooltip>
        </Box>
        <Typography component="div" color="text.secondary">{chapter.name}</Typography>
        <Typography component="div" color="text.secondary">{side.name} Side</Typography>
        <Typography component="div" color="text.secondary">{checkpoint.name}</Typography>
        <Divider orientation="horizontal" sx={{marginTop: 1, marginBottom: 1}} />
        <Typography component="div" color="text.secondary">Debug id: {room.debugId}</Typography>
        <Typography component="div" color="text.secondary">Room id: {room.roomId}</Typography>
        <Typography component="div" color="text.secondary" sx={{marginTop: 1}}>Checkpoint room: {room.checkpointRoomNo}</Typography>
        <Typography component="div" color="text.secondary">Level room: {room.levelRoomNo}</Typography>
        <Box display="flex" gap={1} marginTop={1} marginBottom={1}>
          <Box width="100%">
            {prevRoom?.link && (
              <Link passHref href={prevRoom.link}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  aria-label={`Go to previous room ${prevRoom.name}`}
                  sx={{width: "100%"}}
                >
                  {prevRoom.name}
                </Button>
              </Link>
            )}
          </Box>
          <Box width="100%">
            {nextRoom?.link && (
              <Link passHref href={nextRoom.link}>
                <Button
                  variant="outlined"
                  endIcon={<NavigateNext />}
                  aria-label={`Go to next room ${nextRoom.name}`}
                  sx={{width: "100%"}}
                >
                  {nextRoom.name}
                </Button>
              </Link>
            )}
          </Box>
        </Box>
      </Container >
    </Fragment>
  );
}

const ImageView: FC<{image: string, roomName: string, onClick?: () => void}> = ({image, roomName, onClick}) => {
  return (
    <AspectBox>
      <NextImage
        unoptimized
        src={getCampImageUrl(image)}
        onClick={onClick}
        alt={`Very large image of room ${roomName}`}
        layout="fill"
        style={{
          imageRendering: "pixelated",
        }}
      />
    </AspectBox>
  );
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    margin: theme.spacing(0.5),
    border: 0,
    fontSize: "0.7rem",
    '&.Mui-disabled': {
      border: 0,
    },
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

export interface RoomProps {
  area: NamedLink;
  chapter: NamedLink;
  side: {
    id: string;
    name: string;
    boundingBox: BoundingBox;
    rooms: CanvasRoom[];
  };
  checkpoint: {
    name: string;
    boundingBox: BoundingBox;
    rooms: CanvasRoom[];
  };
  room: RoomPropsRoom;
  prevRoom?: PartiallyNamedLink;
  nextRoom?: PartiallyNamedLink;
}

interface NamedLink {
  id: string;
  name: string;
  link: string;
}

interface PartiallyNamedLink {
  name?: string;
  link: string;
}

export interface RoomPropsRoom {
  name?: string;
  debugId: string;
  roomId: string;
  checkpointRoomNo: string;
  levelRoomNo: string;
  teleportParams: string;
  canvas: Canvas;
}

interface RoomParams extends ParsedUrlQuery {
  areaId: string;
  chapterId: string;
  sideId: string;
  roomId: string;
}

export const getStaticPaths: GetStaticPaths<RoomParams> = async () => {
  const paths: {params: RoomParams; locale?: string}[] = [];

  for (const areaId of VALID_AREAS) {
    const area: Area = await fetchArea(areaId);
    for (const chapterId of area.chapters) {
      const chapter: Chapter = await fetchChapter(areaId, chapterId);
      for (const sideId of chapter.sides) {
        const side: Side = await fetchSide(areaId, chapterId, sideId);
        for (const roomId of Object.keys(side.rooms)) {
          paths.push({params: {areaId, chapterId, sideId, roomId}});
        }
      }
    }
  }

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<RoomProps, RoomParams> = async ({params}) => {
  if (params === undefined) {
    throw Error("Params was not defined.")
  }

  const {areaId, chapterId, sideId, roomId} = params;

  const area: Area = await fetchArea(areaId);
  area.id = areaId;

  const chapter: Chapter = await fetchChapter(areaId, chapterId);
  chapter.id = chapterId;

  const side: Side = await fetchSide(areaId, chapterId, sideId);
  side.id = sideId;

  const room: Room | undefined = side.rooms[roomId];
  if (room === undefined) {
    throw Error(`Could not find room ${roomId} in side ${side.name}`);
  }

  const checkpoint: Checkpoint | undefined = side.checkpoints[room.checkpointNo];
  if (checkpoint === undefined) {
    throw Error(`Could not find checkpoint ${room.checkpointNo} in side ${side.name}`);
  }

  const roomIndex: number = checkpoint.roomOrder.findIndex(id => id === roomId);

  const prevRoomId: string | undefined = checkpoint.roomOrder[roomIndex - 1] ?? side.checkpoints[room.checkpointNo - 1]?.roomOrder.slice(-1)[0];
  const nextRoomId: string | undefined = checkpoint.roomOrder[roomIndex + 1] ?? side.checkpoints[room.checkpointNo + 1]?.roomOrder[0];
  const prevRoom: Room | undefined = prevRoomId ? side.rooms[prevRoomId] : undefined;
  const nextRoom: Room | undefined = nextRoomId ? side.rooms[nextRoomId] : undefined;

  const sideRoomIndex = side.checkpoints.slice(0, room.checkpointNo).reduce<number>((prev, curr) => prev + curr.roomCount, 0) + roomIndex;

  return {
    props: {
      area: {
        id: areaId,
        name: area.name,
        link: `/${areaId}`,
      },
      chapter: {
        id: chapterId,
        name: chapter.name,
        link: `/${areaId}/${chapterId}`
      },
      side: {
        id: sideId,
        name: side.name,
        boundingBox: side.canvas.boundingBox,
        rooms: Object.entries(side.rooms).map(([sideRoomId, sideRoom]) => ({
          position: sideRoom.canvas.position,
          image: `${area.id}/rooms/${chapter.id}/${side.id}/${sideRoomId}`,
        }))
      },
      checkpoint: {
        name: checkpoint.name,
        boundingBox: checkpoint.canvas.boundingBox,
        rooms: Object.entries(side.rooms).filter(([_, sideRoom]) => sideRoom.checkpointNo === room.checkpointNo).map(([checkpointRoomId, checkpointRoom]) => ({
          position: checkpointRoom.canvas.position,
          image: `${area.id}/rooms/${chapter.id}/${side.id}/${checkpointRoomId}`,
        })),
      },
      room: {
        ...room.name && {name: room.name},
        debugId: roomId,
        roomId: `${checkpoint.abbreviation}-${roomIndex + 1}`,
        levelRoomNo: `${sideRoomIndex + 1}/${side.roomCount}`,
        checkpointRoomNo: `${roomIndex + 1}/${checkpoint.roomCount}`,
        teleportParams: `?area=${area.gameId}/${chapter.gameId}&side=${sideId}&level=${roomId}${(room.entities.spawn && room.entities.spawn[0]?.x && room.entities.spawn[0]?.y) ? `&x=${room.entities.spawn[0].x}&y=${room.entities.spawn[0].y}` : ""}`,
        canvas: room.canvas,
      },
      ...prevRoom && {
        prevRoom: {
          ...prevRoom.name && {name: prevRoom.name},
          link: `/${areaId}/${chapterId}/${sideId}/${prevRoomId}`,
        }
      },
      ...nextRoom && {
        nextRoom: {
          ...nextRoom.name && {name: nextRoom.name},
          link: `/${areaId}/${chapterId}/${sideId}/${nextRoomId}`,
        }
      },
    }
  }
}

export default RoomPage;