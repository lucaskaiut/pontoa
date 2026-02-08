import { Icon } from "@mdi/react";
import { mdiWeatherNight, mdiWeatherSunny } from "@mdi/js";
import { useTheme } from "../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 dark:hover:bg-dark-surface-hover"
      aria-label="Alternar tema"
    >
      <Icon 
        path={theme === 'dark' ? mdiWeatherSunny : mdiWeatherNight} 
        size={1.3} 
        className="text-gray-700 dark:text-blue-400" 
      />
    </button>
  );
}

