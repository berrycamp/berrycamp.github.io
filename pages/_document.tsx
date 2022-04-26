import {Head, Html, Main, NextScript} from 'next/document';

const Document = () => {
  return (
    <Html lang='en'>
      <Head>
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://berrycamp.com" />
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
        <script dangerouslySetInnerHTML={{__html: blockingSetThemeMinified}} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document;

const blockingSetThemeMinified = `!function(){"dark"==("dark"===localStorage.getItem("theme")?"dark":!0===matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")&&document.documentElement.setAttribute("data-theme","dark")}();`;

/**
 * Get and set the prefered user theme.
 */
function setTheme() {
  function getTheme() {
    if (localStorage.getItem("theme") === "dark") {
      return "dark"
    }
    return matchMedia("(prefers-color-scheme: dark)").matches === true ? "dark" : "light"
  }

  if (getTheme() === "dark") {
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
