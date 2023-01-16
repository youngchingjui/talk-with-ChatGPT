import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles.css";

const MyApp = ({ Component, pageProps }) => {
  return (
    <React.StrictMode>
      <Component {...pageProps} />
    </React.StrictMode>
  );
};

export default MyApp;
