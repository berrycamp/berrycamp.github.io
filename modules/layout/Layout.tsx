import {ThemeProvider} from "@emotion/react";
import {DarkMode, GridViewSharp, LightMode, ViewListSharp} from "@mui/icons-material";
import {AppBar, Box, createTheme, CssBaseline, IconButton, styled, Theme, ToggleButton, ToggleButtonGroup, Toolbar, Tooltip, Typography} from "@mui/material";
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
                      priority
                      unoptimized
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
                <StyledToggleButtonGroup exclusive size="small" value={view} onChange={(_, newView) => newView && setView(newView)}>
                  <ToggleButton value="grid">
                    <GridViewSharp fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ViewListSharp fontSize="small" />
                  </ToggleButton>
                </StyledToggleButtonGroup>
                <Tooltip title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"} enterDelay={500}>
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

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme}) => ({
  ...theme.palette.mode === "light" && {
    '& .MuiToggleButton-root': {
      borderColor: "rgb(255, 255, 255, 0.2)",
      "&:hover": {
        backgroundColor: "rgb(255, 255, 255, 0.2)",
      }
    },
    '& .MuiButtonBase-root': {
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