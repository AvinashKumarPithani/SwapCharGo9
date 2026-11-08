import { Box, Drawer, IconButton, styled, Typography } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import PriceSlider from "./PriceSlider";
import { useValue } from "../../context/ContextProvider";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { containerRef } = useValue();
  return (
    <Drawer
      variant="persistent"
      hideBackdrop={true}
      open={isOpen}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "min(320px, calc(100vw - 28px))", sm: 320 },
          boxSizing: "border-box",
          borderRight: 1,
          boxShadow: "12px 0 32px rgba(0, 0, 0, 0.22)",
        },
      }}
    >
      <DrawerHeader>
        <Typography variant="subtitle1" fontWeight={700}>Search & filters</Typography>
        <IconButton aria-label="Close search and filters" onClick={() => setIsOpen(false)}>
          <ChevronLeft fontSize="large" />
        </IconButton>
      </DrawerHeader>
      <Box sx={{ width: "100%", px: 2.5, pb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Search a place, then narrow stations by price.
        </Typography>
        <Box ref={containerRef}></Box>
        <PriceSlider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
