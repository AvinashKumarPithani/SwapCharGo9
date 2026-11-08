import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#172126", contrastText: "#ffffff" },
    secondary: { main: "#79b84a", contrastText: "#142014" },
    background: { default: "#f4f7f5", paper: "#ffffff" },
    text: { primary: "#1d2924", secondary: "#5c6962" },
    divider: "#e1e8e3",
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    button: { fontWeight: 600, textTransform: "none" },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 2px 12px rgba(16, 32, 25, 0.12)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 9, minHeight: 40, paddingInline: 16 },
        outlinedPrimary: {
          borderColor: "#172126",
          color: "#172126",
          "&:hover": {
            borderColor: "#172126",
            backgroundColor: "#172126",
            color: "#ffffff",
          },
        },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": { backgroundColor: "#293a40", boxShadow: "none" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e1e8e3",
          borderRadius: 16,
          boxShadow: "0 5px 18px rgba(25, 45, 33, 0.08)",
          overflow: "hidden",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: "#ffffff", borderColor: "#e1e8e3" },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { backgroundColor: "#ffffff", minHeight: 64 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { backgroundImage: "none" },
      },
    },
  },
});

export default theme;
