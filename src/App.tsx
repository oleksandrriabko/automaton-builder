import React from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from "@material-ui/core";
import { theme } from "./theme/main";
import Header from "./components/header/automata-builder";
import { SettingsProvider } from "./context/settings";
import { UserProvider } from "./context/user";
import { SnackbarProvider } from "notistack";
import { Routes } from './Routes';

function App() {
  return (
    <SettingsProvider>
      <UserProvider>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <div className="App">
              <Router>
                <Routes />
              </Router>
            </div>
          </SnackbarProvider>
        </ThemeProvider>
      </UserProvider>
    </SettingsProvider>
  );
}

export default App;
