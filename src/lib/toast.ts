// This file serves as a compatibility layer for common toast functions
// similar to the 'sonner' library but using our local toast implementation

import { toast as baseToast } from "@/components/ui/use-toast";

// Create a drop-in replacement for the sonner toast API
export const toast = {
  // Success toast (green)
  success: (message: string) => {
    baseToast({
      title: "Success",
      description: message,
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-900",
    });
  },

  // Error toast (red)
  error: (message: string) => {
    baseToast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },

  // Info toast (blue)
  info: (message: string) => {
    baseToast({
      title: "Info",
      description: message,
      variant: "default",
      className: "bg-blue-50 border-blue-200 text-blue-900",
    });
  },

  // Warning toast (orange)
  warning: (message: string) => {
    baseToast({
      title: "Warning",
      description: message,
      variant: "default",
      className: "bg-orange-50 border-orange-200 text-orange-900",
    });
  },

  // Default toast (neutral)
  message: (message: string) => {
    baseToast({
      description: message,
    });
  },
};

export default toast;
