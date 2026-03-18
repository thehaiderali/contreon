import { ThemeContext } from "@/context/theme-context";
import { useContext } from "react";

export const useTheme = () => useContext(ThemeContext)