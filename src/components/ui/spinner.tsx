import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function Spinner({ size = "default", className, ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div
      role="status"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <Loader2 className={cn(
        "animate-spin text-blue-500",
        sizeClasses[size]
      )} />
      <span className="sr-only">Loading</span>
    </div>
  );
}
