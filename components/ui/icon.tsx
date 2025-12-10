import * as React from "react";
import * as Iconoir from "iconoir-react";
import { cn } from "@/lib/utils";

interface AppIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

export function AppIcon({ name, className, ...props }: AppIconProps) {
  const IconComponent =
    (Iconoir as unknown as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[
      name
    ];

  if (!IconComponent) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn(`[AppIcon] Unknown icon "${name}"`);
    }
    return null;
  }

  return (
    <IconComponent
      className={cn("w-4 h-4", className)}
      {...props}
    />
  );
}


