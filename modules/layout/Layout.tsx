import {DarkMode, Fireplace, GridViewSharp, LightMode, ViewListSharp} from "@mui/icons-material";
import {AppBar, Box, IconButton, styled, ToggleButton, ToggleButtonGroup, Toolbar, Tooltip, Typography} from "@mui/material";
import {getScreenURL} from "logic/fetch/image";
import {useCampContext} from "logic/provide/CampContext";
import {getMetadataTitle, getTitle} from "logic/utils/title";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {FC, Fragment, useState} from "react";

export const COZY_IMAGE_URL = "https://cdn.berry.camp/file/berrycamp/static/welcome/images"

const COZY_IMAGE_COUNT = 7;

export const Layout: FC<LayoutProps> = ({title, description, image, children}) => {
  const {settings, setView, toggleTheme, toggleSubrooms} = useCampContext();

  const [cozyMode, setCozyMode] = useState<boolean>(false);

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
        <AppBar position="static">
          <Toolbar
            variant="dense"
            sx={{
              "&.MuiToolbar-root": {
                paddingLeft: 0,
              }
            }}
          >
            <Box flexGrow={1} minWidth={0}>
              <Link passHref href="/">
                <Box height={48} width={288} position="relative" display="flex" alignItems="center" sx={{cursor: "pointer"}}>
                  <Box sx={{display: {xs: "none", sm: "block"}}}>
                    <Image
                      unoptimized
                      style={{minWidth: 0}}
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
            <Box display="flex" alignItems="center" gap={0.5}>
              <Tooltip title={cozyMode ? "Turn off cozy mode" : "Turn on cozy mode"}>
                <StyledToggleButton
                  size="small"
                  value="check"
                  selected={cozyMode}
                  onClick={() => setCozyMode(!cozyMode)} sx={{marginRight: 1}}
                  aria-label="Toggle comfy mode"
                >
                  <Fireplace fontSize="small" />
                </StyledToggleButton>
              </Tooltip>
              <Tooltip title="Change view">
                <ToggleButtonGroup exclusive size="small" value={settings.view} onChange={(_, newView) => newView && setView(newView)}>
                  <StyledToggleButton value="grid" aria-label="Enable grid view mode">
                    <GridViewSharp fontSize="small" />
                  </StyledToggleButton>
                  <StyledToggleButton value="list" aria-label="Enable list view mode">
                    <ViewListSharp fontSize="small" />
                  </StyledToggleButton>
                </ToggleButtonGroup>
              </Tooltip>
              <Tooltip title={settings.theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
                <IconButton onClick={toggleTheme} color="inherit">
                  {settings.theme === "light" ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        {cozyMode ? (
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

interface LayoutProps {
  title?: string;
  description: string;
  image: string;
}

const StyledToggleButton = styled(ToggleButton)(({theme}) => ({
  ...theme.palette.mode === "light" && {
    '&.MuiToggleButton-root': {
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