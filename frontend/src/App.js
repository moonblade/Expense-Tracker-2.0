import React from "react";
import {
  CssBaseline,
} from "@mui/material";
import { LoginProvider } from "./LoginContext";
import MainContent from "./MainContent";

function App() {
  return (
    <>
      <CssBaseline />
      <LoginProvider>
        <MainContent />
      </LoginProvider>
    </>
  );
}

export default App;

