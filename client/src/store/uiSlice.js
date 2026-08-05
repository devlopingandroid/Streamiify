import { createSlice } from "@reduxjs/toolkit";

const applyThemeDOM = (theme) => {
  if (typeof window === "undefined") return;
  const root = window.document.documentElement;
  let isDark = false;
  
  if (theme === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    isDark = theme === "dark";
  }

  root.setAttribute("data-theme", isDark ? "dark" : "light");
  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
};

const initialState = {
  theme: localStorage.getItem("streamify-theme") || "dark",
  sidebarExpanded: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarExpanded = !state.sidebarExpanded;
    },
    setSidebarExpanded: (state, action) => {
      state.sidebarExpanded = action.payload;
    },
    setTheme: (state, action) => {
      const theme = action.payload;
      state.theme = theme;
      localStorage.setItem("streamify-theme", theme);
      applyThemeDOM(theme);
    },
    initializeTheme: (state) => {
      applyThemeDOM(state.theme);
    }
  },
});

export const { toggleSidebar, setSidebarExpanded, setTheme, initializeTheme } = uiSlice.actions;
export default uiSlice.reducer;
