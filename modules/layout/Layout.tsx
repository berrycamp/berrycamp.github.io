import {AppBar, Box, Toolbar, Typography} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import {FC, PropsWithChildren} from "react";
import {SettingsMenu} from "~/modules/settings/SettingsMenu";

export const Layout: FC<PropsWithChildren> = ({children}) => (
  <>
    <AppBar position="fixed">
      <Toolbar
        variant="dense"
        sx={{
          "&.MuiToolbar-root": {
            paddingLeft: 0,
            paddingRight: 0.5,
          }
        }}
      >
        <Box flexGrow={1} minWidth={0}>
          <Box height={48} width={288} position="relative">
            <Link
              passHref
              href="/"
              style={{position: "relative", display: "flex", alignItems: "center", width: "100%", height: "100%"}}
            >
              <a>
                <Image
                  unoptimized
                  priority
                  src={'/img/logo.png'}
                  alt=""
                  layout="fill"
                  style={{imageRendering: "pixelated"}}
                />
                <Box display="flex" position="absolute" left={12} height="100%" alignItems="center">
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
    <Toolbar variant="dense"/>
    <main>
      {children}
    </main>
  </>
);