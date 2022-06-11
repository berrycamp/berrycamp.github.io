import {AppBar, Box, Toolbar, Typography} from "@mui/material";
import {useCampContext} from "logic/provide/CampContext";
import {SettingsMenu} from "modules/settings/SettingsMenu";
import Image from "next/image";
import Link from "next/link";
import {FC, Fragment} from "react";

export const Layout: FC = ({children}) => {
  const {settings} = useCampContext();

  return (
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
      {/* {settings.cozyMode ? (
        <Cozy />
      ) : ( */}
        <Fragment>
          {children}
        </Fragment>
      {/* )} */}
    </main>
  );
}