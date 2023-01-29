import "bootstrap/dist/css/bootstrap.min.css"
import "../styles.css"

import { Analytics } from "@vercel/analytics/react"
import React from "react"

const MyApp = ({ Component, pageProps }) => {
  return (
    <React.StrictMode>
      <Component {...pageProps} />
      <Analytics />
    </React.StrictMode>
  )
}

export default MyApp
