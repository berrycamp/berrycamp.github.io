import {BrightnessAuto, CropDinSharp, CropSquare, DarkMode, Fireplace, GridViewSharp, LightMode, Restore, Settings, Splitscreen, ViewListSharp} from "@mui/icons-material";
import {AppBar, Box, Divider, Icon, IconButton, ListItem, ListItemIcon, Menu, MenuItem, styled, SvgIcon, TextField, Toolbar, Tooltip, Typography} from "@mui/material";
import {getScreenURL} from "logic/fetch/image";
import {useCampContext} from "logic/provide/CampContext";
import {getMetadataTitle, getTitle} from "logic/utils/title";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {FC, Fragment, MouseEvent, useEffect, useState} from "react";
import {EVEREST_ICON} from "./everest";

export const COZY_IMAGE_URL = "https://cdn.berry.camp/file/berrycamp/static/welcome/images"

const COZY_IMAGE_COUNT = 7;

export const Layout: FC<LayoutProps> = ({title, description, image, children}) => {
  const {settings} = useCampContext();

  const [mounted, setMounted] = useState(false);

  /**
   * Component has mounted and rehydration has finished. Render all content blocked by the theme.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

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
        {mounted && (
          <Fragment>
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
                  <Box height={48} width={288} position="relative">
                    <Link passHref href="/">
                      <a style={{position: "relative", display: "flex", alignItems: "center", width: "100%", height: "100%"}}>
                        <Box sx={{position: "relative", width: "100%", height: "100%", display: {xs: "none", sm: "block"}}}>
                          <Image
                            unoptimized
                            priority
                            src={'/img/logo.png'}
                            alt=""
                            layout="fill"
                            style={{
                              imageRendering: "pixelated",
                            }}
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
                      </a>
                    </Link>
                  </Box>
                </Box>
                <SettingsMenu />
              </Toolbar>
            </AppBar>
            {settings.cozyMode ? (
              <Fragment>
                <Box position="fixed" bottom={0} zIndex={-1} width="100%" height="100%">
                  <Image
                    unoptimized
                    priority
                    objectFit="cover"
                    src={`${COZY_IMAGE_URL}/${Math.floor(Math.random() * COZY_IMAGE_COUNT) + 1}.png`}
                    alt='A large comfy animation of Madeline near a campfire in-game'
                    layout="fill"
                    style={{
                      imageRendering: "pixelated",
                    }}
                  />
                </Box>
              </Fragment>
            ) : (
              <Fragment>
                {children}
              </Fragment>
            )}
          </Fragment>
        )}
      </main>
    </Fragment >
  );
}

const SettingsMenu: FC = () => {
  const {settings, changeTheme, toggleListMode, toggleHideSubrooms, toggleCozyMode, setPort} = useCampContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Fragment>
      <StyledIconButton onClick={handleOpen} aria-label="open settings">
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
        <MenuItem onClick={changeTheme}>
          <ListItemIcon>
            {settings.theme === "light" ? (
              <LightMode fontSize="small" />
            ) : settings.theme === "dark" ? (
              <DarkMode fontSize="small" />
            ) : (
              <BrightnessAuto fontSize="small" />
            )}
          </ListItemIcon>
          {settings.theme === "light" ? "Light theme" : settings.theme === "dark" ? "Dark theme" : "System theme"}
        </MenuItem>
        <MenuItem onClick={toggleListMode}>
          <ListItemIcon>
            {settings.listMode ? <ViewListSharp fontSize="small" /> : <GridViewSharp fontSize="small" />}
          </ListItemIcon>
          {settings.listMode ? "List view" : "Grid view"}
        </MenuItem>
        <MenuItem onClick={toggleHideSubrooms}>
          <ListItemIcon>
            {settings.hideSubrooms ? <CropSquare fontSize="small" /> : <Splitscreen fontSize="small" />}
          </ListItemIcon>
          {settings.hideSubrooms ? "Subrooms hidden" : "Subrooms shown"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={toggleCozyMode}>
          <ListItemIcon>
            {settings.cozyMode ? <Fireplace fontSize="small" /> : <CropDinSharp sx={{fontSize: "1.4rem", marginLeft: "-1px"}} />}
          </ListItemIcon>
          {settings.cozyMode ? "Cozy mode on" : "Cozy mode off"}
        </MenuItem>
        <Divider />
        <ListItem>
          <Tooltip title="Everest Debug RC Port for opening rooms in game" enterDelay={500}>
            <Box display="flex">
              <Icon component="div" sx={{display: "flex", minWidth: 36, height: 20}}>
                <SvgIcon viewBox="615 1135 2776 1743" color="action" fontSize="small">
                  <path d={EVEREST_ICON} strokeWidth="0.1" />
                </SvgIcon>
              </Icon>
              <TextField
                type="number"
                size="small"
                variant="standard"
                placeholder="Custom port"
                value={settings.port ?? ""}
                onChange={event => setPort(Number(event.target.value) || undefined)}
                InputProps={{
                  disableUnderline: true,
                }}
                inputProps={{
                  min: 0,
                }}
                sx={{
                  "& .MuiInput-input": {
                    padding: 0,
                    "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                      WebkitAppearance: "none",
                    }
                  },
                }}
              />
            </Box>
          </Tooltip>
          <IconButton size="small" onClick={() => setPort()}>
            <Restore fontSize="small" />
          </IconButton>
        </ListItem>
      </Menu>
    </Fragment >
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