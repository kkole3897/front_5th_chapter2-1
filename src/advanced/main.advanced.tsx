import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AdvancedApp } from "@/app";

const root = createRoot(document.getElementById("app")!);

root.render(
  <StrictMode>
    <AdvancedApp />
  </StrictMode>,
);
