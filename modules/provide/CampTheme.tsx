import {createTheme, darkScrollbar, PaletteColorOptions, Theme} from "@mui/material";
import {ThemeProvider} from "@mui/system";
import {FC, useEffect} from "react";
import {useCampContext} from "./CampContext";

export const PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Provide the MUI theme.
 */
export const CampThemeProvider: FC = ({children}) => {
  const {settings, setPrefersDark} = useCampContext();

  let provideDarkTheme: boolean = settings.prefersDark ?? false;
  if (settings.theme !== undefined) {
    provideDarkTheme = settings.theme === "dark";
  }

  /**
   * Update the prefered mode on mount.
   */
  useEffect(() => {
    setPrefersDark(matchMedia(PREFERS_DARK_QUERY).matches);
  }, [setPrefersDark])

  /**
   * Listen for changes to the prefered mode.
   */
  useEffect(() => {
    const updatePrefersDarkMode = (event: MediaQueryListEvent): void => setPrefersDark(event.matches);

    const darkQuery = matchMedia(PREFERS_DARK_QUERY);
    darkQuery.addEventListener("change", updatePrefersDarkMode)

    return () => darkQuery.removeEventListener("change", updatePrefersDarkMode)
  }, [setPrefersDark]);

  return (
    <ThemeProvider theme={provideDarkTheme ? darkTheme : lightTheme}>
      {children}
    </ThemeProvider>
  )
}

const primary: PaletteColorOptions = {
  main: "#c800c8",
}

const secondary: PaletteColorOptions = {
  main: "#cc252c",
}

const transition: string = "background 0.1s linear";

const lightTheme: Theme = createTheme({
  palette: {
    mode: "light",
    primary,
    secondary,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition,
        }
      }
    }
  }
});

const darkTheme: Theme = createTheme({
  palette: {
    mode: "dark",
    primary,
    secondary,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition,
          ...darkScrollbar(),
        }
      }
    }
  }
});