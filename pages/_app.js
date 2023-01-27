import "bootstrap/dist/css/bootstrap.min.css"
import "../styles.css"

import React from "react"

const MyApp = ({ Component, pageProps }) => {
  return (
    <React.StrictMode>
      <Component {...pageProps} />
    </React.StrictMode>
  )
}

export default MyApp
