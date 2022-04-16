import {Head, Html, Main, NextScript} from 'next/document';

const Document = () => {
  return (
    <Html>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://berrycamp.com" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="msapplication-TileColor" content="#c800c8" />
        <meta name="theme-color" content="#c800c8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#c800c8" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body>
        <script dangerouslySetInnerHTML={{__html: blockingSetTheme}} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document;

/**
 * Get and set the prefered user theme.
 */
function setTheme() {
  function getTheme() {
    const preference = window.localStorage.getItem("theme");
    const hasPreference = typeof preference === "string";
    if (hasPreference) {
      return preference;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    if (typeof mql.matches === "boolean") {
      return mql.matches ? "dark" : "light";
    }
    return "light";
  }

  const theme = getTheme();
  const root = document.documentElement;
  root.style.setProperty("--initial-theme", theme)
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}

/**
 * Prevent theme flicker on page load.
 */
const blockingSetTheme = `(function() {
  ${setTheme.toString()}
  setTheme();
})()
`;

