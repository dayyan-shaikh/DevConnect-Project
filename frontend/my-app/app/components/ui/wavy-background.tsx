import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { forwardRef } from "react";

interface WavyBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
}

export const WavyBackground = forwardRef<HTMLDivElement, WavyBackgroundProps>(
  (
    {
      children,
      className,
      colors = ["#38bdf8", "#818cf8", "#c084fc"],
      waveWidth = 50,
      backgroundFill = "hsl(var(--background))",
      blur = 10,
      speed = "fast",
      waveOpacity = 0.5,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    const waveDuration = speed === "fast" ? 4 : 7;
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-[40rem] w-full items-center justify-center overflow-hidden",
          containerClassName,
        )}
        {...props}
      >
        <div className="absolute inset-0 z-0">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${waveWidth * 4} ${waveWidth * 2}`}
            preserveAspectRatio="none"
          >
            <defs>
              {colors.map((color, i) => (
                <motion.path
                  key={i}
                  d={`M 0,${waveWidth / 2} C ${waveWidth / 2},0 ${waveWidth * 1.5},${
                    waveWidth * 2
                  } ${waveWidth * 2},${waveWidth / 2} S ${waveWidth * 3},0 ${waveWidth * 4},${
                    waveWidth / 2
                  }`}
                  fill={color}
                  opacity={waveOpacity}
                  initial={{
                    x: -waveWidth * 4,
                  }}
                  animate={{
                    x: 0,
                  }}
                  transition={{
                    x: {
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                      duration: waveDuration,
                      ease: "linear",
                    },
                  }}
                />
              ))}
            </defs>
          </svg>
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blur}px)`,
              backgroundColor: backgroundFill,
            }}
          />
        </div>
        <div className={cn("relative z-10 w-full", className)}>{children}</div>
      </div>
    );
  },
);

WavyBackground.displayName = "WavyBackground";
