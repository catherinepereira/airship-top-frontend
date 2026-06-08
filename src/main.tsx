import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { installDevMock } from "./devMock.ts";
import "./index.css";

if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  installDevMock();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
