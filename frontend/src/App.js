import React from "react";
import {
  CssBaseline,
} from "@mui/material";
import { LoginProvider } from "./LoginContext";
import MainContent from "./MainContent";
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <>
      <CssBaseline />
      <LoginProvider>
        <BrowserRouter>
          <MainContent />
        </BrowserRouter>
      </LoginProvider>
    </>
  );
}

export default App;

