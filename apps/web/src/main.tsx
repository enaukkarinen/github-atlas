import ReactDOM from "react-dom/client";

import { App } from "./app/App";
// import "./index.css";
import { StrictMode } from "react";
import { AppProviders } from "./app/Providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
