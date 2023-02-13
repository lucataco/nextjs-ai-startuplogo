import Script from 'next/script'
import '../styles/styles.css';

function MyApp({ Component, pageProps }) {
  return  (
    <>
      <Script  defer data-domain="startuplogos.up.railway.app" src="https://data.lucata.co/js/script.js" />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
