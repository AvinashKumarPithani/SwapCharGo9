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

const NavBar = () => {
  const {
    state: { currentUser },
    dispatch,
  } = useValue();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
              sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}
            >
              Swap Charge & Go
            </Typography>
            <Typography
              variant="h6"
              component="h1"
              noWrap
              sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
            >
              SCG
            </Typography>
            {!currentUser ? (
              <Button
                color="inherit"
                variant="outlined"
                startIcon={<Lock />}
                sx={{
                  borderColor: "rgba(255,255,255,0.7)",
                  color: "common.white",
                  "&:hover": {
                    borderColor: "common.white",
                    backgroundColor: "rgba(255,255,255,0.12)",
                  },
                }}
                onClick={() => dispatch({ type: "OPEN_LOGIN" })}
              >
                Login
              </Button>
            ) : (
              <UserIcons />
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      <Sidebar {...{ isOpen, setIsOpen }} />
    </>
  );
};

export default NavBar;
