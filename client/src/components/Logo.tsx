import logoDark from "@assets/Testifaith-best_1763468571844.png";
import { useTheme } from "./ThemeProvider";

interface LogoProps {
  className?: string;
  /** Force the white-on-dark variant regardless of the current theme.
   *  Use when the logo is placed on a dark/image background in light mode. */
  onDark?: boolean;
}

export default function Logo({ className = "", onDark = false }: LogoProps) {
  const { theme } = useTheme();

  // In light mode the dark logo image (white text / black bg) is CSS-inverted so
  // the background becomes white and the text becomes dark — matching the light header.
  // When `onDark` is true (e.g. branding panels with a fixed dark background) we
  // skip the inversion so the white text remains visible.
  const applyInvert = theme === "light" && !onDark;

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoDark}
        alt="Testifaith"
        className="h-10 w-auto"
        style={applyInvert ? { filter: "invert(1) hue-rotate(180deg)" } : undefined}
      />
    </div>
  );
}
