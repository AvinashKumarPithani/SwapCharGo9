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
          <Toolbar disableGutters sx={{ minHeight: { xs: 58, sm: 64 } }}>
            <Box sx={{ mr: { xs: 0.5, sm: 1 } }}>
              <IconButton
                size="medium"
                color="inherit"
                aria-label="Open map menu"
                onClick={() => setIsOpen(true)}
              >
                <Menu fontSize="medium" />
              </IconButton>
            </Box>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                fontWeight: 750,
                letterSpacing: "-.04em",
              }}
            >
              SwapCharGo
            </Typography>
            <Typography
              variant="h6"
              component="div"
              noWrap
              sx={{
                flexGrow: 1,
                display: { xs: "flex", md: "none" },
                fontWeight: 750,
                letterSpacing: "-.04em",
              }}
            >
              SwapCharGo
            </Typography>
            {!currentUser ? (
              <Button
                color="inherit"
                variant="outlined"
                startIcon={<Lock />}
                sx={{
                  borderColor: "rgba(255,255,255,0.7)",
                  color: "common.white",
                  minHeight: 40,
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
