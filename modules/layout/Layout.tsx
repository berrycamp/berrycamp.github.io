import {ThemeProvider} from "@emotion/react";
import {DarkMode, LightMode} from "@mui/icons-material";
import {AppBar, Box, createTheme, CssBaseline, IconButton, Theme, Toolbar, Tooltip, Typography} from "@mui/material";
import {getTitle} from "logic/utils/title";
import Head from "next/head";
import Image from "next/image";
import styles from "pages/Common.module.css";
import {FC, Fragment, useEffect, useMemo, useState} from "react";

const MODE_KEY = "theme";

export const Layout: FC<LayoutProps> = ({title, description, imgUrl, children}) => {
  const [mode, setMode] = useState<"dark" | "light">("light");
  const theme: Theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: "#c800c8",
      },
    }
  }), [mode]);

  /**
   * Get the prefered mode from the user or the system.
   * @returns The prefered mode.
   */
  const getModePreference = (): "dark" | "light" => {
    const mql: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    if (typeof mql.matches === "boolean") {
      return mql.matches ? "dark" : "light";
    };
    return "light";
  }

  /**
   * Get the user or media mode preference. Default to light if not provided.
   */
  useEffect(() => {
    const userMode: string | null = window.localStorage.getItem(MODE_KEY);
    if (userMode !== null) {
      setMode("dark");
    } else {
      setMode(getModePreference());
    }
  }, [])

  /**
   * Store mode in local storage.
   */
  useEffect(() => {
    window.localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  return (
    <Fragment>
      <Head>
        <title>{getTitle(title)}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={getTitle(title)} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imgUrl} />
        <meta name="theme-color" content="#c800c8" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://berrycamp.com" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <main>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar
              variant="dense"
              sx={{
                "&.MuiToolbar-root": {
                  paddingLeft: 0,
                }
              }}
            >
              <Box flexGrow={1}>
                <Box height={48} width={288} position="relative" display="flex" alignItems="center">
                  <Image
                    className={styles.roomimage}
                    src={'/img/logo.png'}
                    alt='Animation of madeline in a campsite in game'
                    layout="fill"
                  />
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
              </Box>
              <Tooltip title="Toggle theme" enterDelay={500}>
                <IconButton onClick={() => setMode(mode === "light" ? "dark" : "light")} color="inherit">
                  {mode === "light" ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>
          {children}
        </ThemeProvider>
      </main>
    </Fragment >
  )
}

interface LayoutProps {
  title: string;
  description: string;
  imgUrl: string;
}
