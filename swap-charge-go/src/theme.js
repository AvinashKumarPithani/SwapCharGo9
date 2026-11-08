import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#79b84a", contrastText: "#202827" },
    secondary: { main: "#d39b2f", contrastText: "#202827" },
    background: { default: "#f5f7f5", paper: "#ffffff" },
    text: { primary: "#202729", secondary: "#65736b" },
    divider: "#e2e8e2",
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
          backgroundColor: "#202827",
          color: "#ffffff",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          "&.MuiPaper-root": { backgroundColor: "#202827" },
        },
        colorPrimary: { backgroundColor: "#202827" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          minHeight: 42,
          paddingInline: 16,
          fontWeight: 650,
        },
        outlinedPrimary: {
          borderColor: "rgba(128, 185, 77, 0.68)",
          color: "#a9d884",
          "&:hover": {
            borderColor: "#80b94d",
            backgroundColor: "rgba(128, 185, 77, 0.12)",
          },
        },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": { backgroundColor: "#91c960", boxShadow: "none" },
          "&.Mui-disabled": {
            color: "rgba(20, 29, 24, 0.55)",
            backgroundColor: "rgba(128, 185, 77, 0.35)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e2e8e2",
          borderRadius: 14,
          backgroundColor: "#ffffff",
          boxShadow: "0 8px 24px rgba(32, 39, 41, 0.08)",
          overflow: "hidden",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: "#ffffff", borderColor: "#e2e8e2" },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { backgroundColor: "#202827", minHeight: 66, color: "#b0bbb5" },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#d0d9d3",
          "&.Mui-selected": { color: "#79b84a" },
          "&:focus-visible": {
            outline: "2px solid #e6b84b",
            outlineOffset: -3,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          backgroundImage: "none",
          border: "1px solid #e2e8e2",
          boxShadow: "0 18px 48px rgba(32, 39, 41, 0.16)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: "#ffffff", backgroundImage: "none" },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8e2",
          boxShadow: "0 12px 32px rgba(32, 39, 41, 0.14)",
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: "#cbd6cc",
          "&.Mui-active": { color: "#79b84a" },
          "&.Mui-completed": { color: "#246b57" },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: "#65736b",
          "&.Mui-active": { color: "#202729", fontWeight: 700 },
          "&.Mui-completed": { color: "#246b57" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd6cc" },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#8fa798",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#79b84a",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: "#65736b", "&.Mui-focused": { color: "#246b57" } },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { color: "#79b84a" },
        markLabel: { color: "#65736b" },
      },
    },
  },
});

export default theme;
