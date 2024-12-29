import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function Loading({ className, size = "md", fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const Spinner = () => (
    <div className={cn(
      "relative",
      sizeClasses[size],
      className
    )}>
      <div className="absolute w-full h-full rounded-full border-2 border-solid border-indigo-100"></div>
      <div className="absolute w-full h-full rounded-full border-2 border-solid border-indigo-500 border-t-transparent animate-spin"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-purple-50/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white/80 p-8 rounded-xl shadow-lg border border-indigo-100 flex flex-col items-center space-y-4">
          <Spinner />
          <p className="text-indigo-900 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return <Spinner />;
}
