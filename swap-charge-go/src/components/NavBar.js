import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Lock, Menu } from "@mui/icons-material";

import { useValue } from "../context/ContextProvider";
import UserIcons from "./user/UserIcons";
import Sidebar from "./sidebar/Sidebar";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

const ColorButton = styled(Button)(({ theme }) => ({
  backgroundColor: "black",
  color:"white",
  '&:hover': {
     backgroundColor: "white",
     borderColor: 'black',
     color:"black"
  },
}));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
  },
});

const NavBar = () => {
  const {
    state: { currentUser },
    dispatch,
  } = useValue();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    <ThemeProvider theme={darkTheme}>
      <AppBar>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box sx={{ mr: 1 }}>
              <IconButton
                size="large"
                color="inherit"
                onClick={() => setIsOpen(true)}
              >
                <Menu />
              </IconButton>
            </Box>
            <Typography
              variant="h6"
              component="h1"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Swap Charge & Go
            </Typography>
            <Typography
              fontfamily={"Ubuntu"}
              variant="h6"
              component="h1"
              noWrap
              sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
            >
              SCG
            </Typography>
            {!currentUser ? (
              <ColorButton
                variant="outlined"
                color="inherit"
                startIcon={<Lock />}
                onClick={() => dispatch({ type: "OPEN_LOGIN" })}
              >
                Login
              </ColorButton>
            ) : (
              <UserIcons />
            )}
          </Toolbar>
        </Container>
      </AppBar>
      </ThemeProvider>
      <Toolbar />
      <Sidebar {...{ isOpen, setIsOpen }} />
    </>
  );
};

export default NavBar;
