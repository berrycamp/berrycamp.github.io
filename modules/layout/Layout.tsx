import {AppBar, Box, Toolbar, Typography} from "@mui/material";
import {useCampContext} from "logic/provide/CampContext";
import {SettingsMenu} from "modules/settings/SettingsMenu";
import Image from "next/image";
import Link from "next/link";
import {FC, Fragment} from "react";

export const COZY_IMAGE_URL = "https://cdn.berry.camp/file/berrycamp/static/welcome/images"

const COZY_IMAGE_COUNT = 7;

export const Layout: FC = ({children}) => {
  const {settings} = useCampContext();

  return (
    <Fragment>
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
      </main>
    </Fragment >
  );
}