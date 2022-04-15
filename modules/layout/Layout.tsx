import {ThemeProvider} from "@emotion/react";
import {DarkMode, GridView, LightMode, ViewList} from "@mui/icons-material";
import {AppBar, Box, createTheme, CssBaseline, IconButton, Paper, Theme, ToggleButton, ToggleButtonGroup, Toolbar, Tooltip, Typography} from "@mui/material";
import {getTitle} from "logic/utils/title";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "pages/Common.module.css";
import {FC, Fragment, useMemo} from "react";

export const Layout: FC<LayoutProps> = ({title, description, imgUrl, mode, toggleMode, view, setView, children}) => {
  const theme: Theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: "#c800c8",
      },
    }
  }), [mode]);

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
                <Link passHref href="/">
                  <Box height={48} width={288} position="relative" display="flex" alignItems="center" sx={{cursor: "pointer"}}>
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
                </Link>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Paper elevation={0} sx={{padding: 0, margin: 0}}>
                  <ToggleButtonGroup exclusive size="small" value={view} onChange={(_, newView) => newView && setView(newView)}>
                    <ToggleButton value="grid">
                      <GridView fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list">
                      <ViewList fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Paper>
                <Tooltip title="Toggle theme" enterDelay={500}>
                  <IconButton onClick={toggleMode} color="inherit">
                    {mode === "light" ? <LightMode /> : <DarkMode />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>
          {children}
        </ThemeProvider>
      </main>
    </Fragment>
  );
}

interface LayoutProps {
  title: string;
  description: string;
  imgUrl: string;
  mode: "light" | "dark";
  toggleMode: () => void;
  view: "grid" | "list"
  setView: (view: "grid" | "list") => void;
}