import { Avatar, Box, IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { useValue } from "../../context/ContextProvider";
import useCheckToken from "../../hooks/useCheckToken";
import UserMenu from "./UserMenu";

const UserIcons = () => {
  useCheckToken();
  const {
    state: { currentUser },
  } = useValue();

  const [anchorUserMenu, setAnchorUserMenu] = useState(null);

  return (
    <Box>
      <Tooltip title="Open User Settings">
        <IconButton aria-label="Open user settings" onClick={(e) => setAnchorUserMenu(e.currentTarget)}>
          <Avatar src={currentUser?.photoURL} alt={currentUser?.name}>
            {currentUser?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <UserMenu {...{ anchorUserMenu, setAnchorUserMenu }} />
    </Box>
  );
};

export default UserIcons;
