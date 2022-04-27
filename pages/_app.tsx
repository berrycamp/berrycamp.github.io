import {CssBaseline} from '@mui/material';
import {CampContextProvider} from 'logic/provide/CampContext';
import {CampPreferencesProvider} from 'logic/provide/CampPreferences';
import {CampThemeProvider} from 'logic/provide/CampTheme';
import {Layout} from 'modules/layout/Layout';
import {NextPage} from 'next';
import {AppProps} from 'next/app';
import '../styles/globals.css';

const App = ({Component, pageProps}: AppProps<GlobalCampProps>) => {
  return (
    <CampContextProvider>
      <CampPreferencesProvider>
        <CampThemeProvider>
          <CssBaseline />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CampThemeProvider>
      </CampPreferencesProvider>
    </CampContextProvider>
  );
}

/**
 * Declare global props to pass through Component to all camp pages.
 */
export interface GlobalCampProps {}

/**
 * Any NextPage provided with global camp props.
 */
export type CampPage<P = {}, IP = P> = NextPage<P & GlobalCampProps, IP>;

export default App;
