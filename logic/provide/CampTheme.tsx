import {createTheme, darkScrollbar, PaletteColorOptions, Theme, useMediaQuery} from "@mui/material";
import {ThemeProvider} from "@mui/system";
import {FC} from "react";
import {useCampContext} from "./CampContext";

/**
 * Provide the MUI theme.
 */
export const CampThemeProvider: FC = ({children}) => {
  const {settings} = useCampContext();

  let darkMode: boolean = useMediaQuery("(prefers-color-scheme: dark)");
  if (settings.theme !== undefined) {
    darkMode = settings.theme === "dark";
  }

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
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