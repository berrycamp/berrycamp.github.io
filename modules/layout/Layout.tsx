import {CropDinSharp, CropSquare, DarkMode, Fireplace, GridViewSharp, LightMode, Settings, Splitscreen, ViewListSharp} from "@mui/icons-material";
import {AppBar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, styled, Toolbar, Typography} from "@mui/material";
import {getScreenURL} from "logic/fetch/image";
import {useCampContext} from "logic/provide/CampContext";
import {getMetadataTitle, getTitle} from "logic/utils/title";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {FC, Fragment, MouseEvent, useState} from "react";

export const COZY_IMAGE_URL = "https://cdn.berry.camp/file/berrycamp/static/welcome/images"

const COZY_IMAGE_COUNT = 7;

export const Layout: FC<LayoutProps> = ({title, description, image, children}) => {
  const {settings} = useCampContext();

  return (
    <Fragment>
      <Head>
        <title>{getTitle(title)}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={getMetadataTitle(title)} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={getScreenURL(image)} />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <main>
        <AppBar position="sticky">
          <Toolbar
            variant="dense"
            sx={{
              "&.MuiToolbar-root": {
                paddingLeft: 0,
                paddingRight: 0.5,
              }
            }}
          >
            <Box flexGrow={1}>
              <Link passHref href="/">
                <Box height={48} width={288} position="relative" display="flex" alignItems="center" sx={{cursor: "pointer"}}>
                  <Box sx={{display: {xs: "none", sm: "block"}}}>
                    <Image
                      unoptimized
                      priority
                      className="pixelated-image"
                      src={'/img/logo.png'}
                      alt='Animation of madeline in a campsite in game'
                      layout="fill"
                    />
                  </Box>
                  <Box display="flex" position="absolute" left={12}>
                    <Typography
                      sx={{
                        fontSize: 28,
                        paddingRight: 1,
                      }}
                    >
                      <span role='img' aria-label='Berry'>🍓</span>
                    </Typography>
                    <Typography
                      component="div"
                      sx={{
                        letterSpacing: 4,
                        color: "white",
                        fontSize: 28,
                        textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
                      }}
                    >
                      camp
                    </Typography>
                  </Box>
                </Box>
              </Link>
            </Box>
            <SettingsMenu />
          </Toolbar>
        </AppBar>
        {settings.cozy ? (
          <Fragment>
            <Box position="fixed" bottom={0} zIndex={-1} width="100%" height="100%">
              <Image
                unoptimized
                priority
                objectFit="cover"
                className="pixelated-image"
                src={`${COZY_IMAGE_URL}/${Math.floor(Math.random() * COZY_IMAGE_COUNT) + 1}.png`}
                alt='A large comfy animation of Madeline near a campfire in-game'
                layout="fill"
              />
            </Box>
          </Fragment>
        ) : (
          <Fragment>
            {children}
          </Fragment>
        )}
      </main>
    </Fragment>
  );
}

const SettingsMenu: FC = () => {
  const {settings, toggleTheme, toggleView, toggleSubrooms, toggleCozy} = useCampContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <StyledIconButton onClick={handleOpen}>
        <Settings />
      </StyledIconButton>
      <Menu
        disableScrollLock
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: 200,
          }
        }}
      >
        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {settings.theme === "light" ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </ListItemIcon>
          {settings.theme === "light" ? "Light theme" : "Dark theme"}
        </MenuItem>
        <MenuItem onClick={toggleView}>
          <ListItemIcon>
            {settings.view === "grid" ? <GridViewSharp fontSize="small" /> : <ViewListSharp fontSize="small" />}
          </ListItemIcon>
          {settings.view === "grid" ? "Grid view" : "List view"}
        </MenuItem>
        <MenuItem onClick={toggleSubrooms}>
          <ListItemIcon>
            {settings.subrooms ? <Splitscreen fontSize="small" /> : <CropSquare fontSize="small" />}
          </ListItemIcon>
          {settings.subrooms ? "Subrooms shown" : "Subrooms hidden"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={toggleCozy}>
          <ListItemIcon>
            {settings.cozy ? <Fireplace fontSize="small" /> : <CropDinSharp sx={{fontSize: "1.4rem", marginLeft: "-1px"}} />}
          </ListItemIcon>
          {settings.cozy ? "Cozy mode on" : "Cozy mode off"}
        </MenuItem>
      </Menu>
    </Fragment>
  );
}

interface LayoutProps {
  title?: string;
  description: string;
  image: string;
}

const StyledIconButton = styled(IconButton)(({theme}) => ({
  ...theme.palette.mode === "light" && {
    '&.MuiIconButton-root': {
      borderColor: "rgb(255, 255, 255, 0.2)",
      "&:hover": {
        backgroundColor: "rgb(255, 255, 255, 0.2)",
      }
    },
    '&.MuiButtonBase-root': {
      color: "white",
      '&.Mui-selected': {
        color: "white",
        backgroundColor: "rgb(255, 255, 255, 0.3)",
        borderColor: "rgb(255, 255, 255, 0.2)",
        "&:hover": {
          backgroundColor: "rgb(255, 255, 255, 0.4)",
        }
      },
    },
  },
}));