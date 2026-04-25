import logoDark from "@assets/Testifaith-best_1763468571844.png";
import logoLight from "@assets/Testifaith_(5)_1768318019146.png";
import { useTheme } from "./ThemeProvider";

export default function Logo({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={theme === "dark" ? logoDark : logoLight} 
        alt="Testifaith" 
        className="h-10 w-auto"
      />
    </div>
  );
}
