import toast from "react-hot-toast";

/**
 * Toast notification configuration
 */
const TOAST_CONFIG = {
  position: "top-right",
  duration: 4000,
  style: {
    borderRadius: "8px",
    fontSize: "14px",
    padding: "12px 16px",
    maxWidth: "400px",
  },
};

/**
 * Success toast configuration with custom styling
 */
const SUCCESS_CONFIG = {
  ...TOAST_CONFIG,
  icon: "✓",
  style: {
    ...TOAST_CONFIG.style,
    background: "#10b981",
    color: "#ffffff",
  },
  iconTheme: {
    primary: "#ffffff",
    secondary: "#10b981",
  },
};

/**
 * Error toast configuration with custom styling
 */
const ERROR_CONFIG = {
  ...TOAST_CONFIG,
  icon: "✕",
  style: {
    ...TOAST_CONFIG.style,
    background: "#ef4444",
    color: "#ffffff",
  },
  iconTheme: {
    primary: "#ffffff",
    secondary: "#ef4444",
  },
};

/**
 * Warning toast configuration with custom styling
 */
const WARNING_CONFIG = {
  ...TOAST_CONFIG,
  icon: "⚠",
  style: {
    ...TOAST_CONFIG.style,
    background: "#f59e0b",
    color: "#ffffff",
  },
  iconTheme: {
    primary: "#ffffff",
    secondary: "#f59e0b",
  },
};

/**
 * Info toast configuration with custom styling
 */
const INFO_CONFIG = {
  ...TOAST_CONFIG,
  icon: "ℹ",
  style: {
    ...TOAST_CONFIG.style,
    background: "#3b82f6",
    color: "#ffffff",
  },
  iconTheme: {
    primary: "#ffffff",
    secondary: "#3b82f6",
  },
};

/**
 * Displays a success toast notification
 * @param {string} message - The success message to display
 * @param {Object} customConfig - Optional custom configuration to override defaults
 * @returns {string} Toast ID for programmatic control
 */
export const successToast = (message, customConfig = {}) => {
  if (!message || typeof message !== "string") {
    console.warn("Toast message must be a non-empty string");
    return null;
  }

  return toast.success(message, {
    ...SUCCESS_CONFIG,
    ...customConfig,
  });
};

/**
 * Displays an error toast notification
 * @param {string} message - The error message to display
 * @param {Object} customConfig - Optional custom configuration to override defaults
 * @returns {string} Toast ID for programmatic control
 */
export const errorToast = (message, customConfig = {}) => {
  if (!message || typeof message !== "string") {
    console.warn("Toast message must be a non-empty string");
    return null;
  }

  return toast.error(message, {
    ...ERROR_CONFIG,
    ...customConfig,
  });
};

/**
 * Displays a warning toast notification
 * @param {string} message - The warning message to display
 * @param {Object} customConfig - Optional custom configuration to override defaults
 * @returns {string} Toast ID for programmatic control
 */
export const warningToast = (message, customConfig = {}) => {
  if (!message || typeof message !== "string") {
    console.warn("Toast message must be a non-empty string");
    return null;
  }

  return toast(message, {
    ...WARNING_CONFIG,
    ...customConfig,
  });
};

/**
 * Displays an info toast notification
 * @param {string} message - The info message to display
 * @param {Object} customConfig - Optional custom configuration to override defaults
 * @returns {string} Toast ID for programmatic control
 */
export const infoToast = (message, customConfig = {}) => {
  if (!message || typeof message !== "string") {
    console.warn("Toast message must be a non-empty string");
    return null;
  }

  return toast(message, {
    ...INFO_CONFIG,
    ...customConfig,
  });
};

/**
 * Displays a loading toast notification
 * @param {string} message - The loading message to display
 * @param {Object} customConfig - Optional custom configuration to override defaults
 * @returns {string} Toast ID for programmatic control (useful for dismissing)
 */
export const loadingToast = (message = "Loading...", customConfig = {}) => {
  return toast.loading(message, {
    ...TOAST_CONFIG,
    duration: Infinity, // Loading toasts should stay until dismissed
    ...customConfig,
  });
};

/**
 * Dismisses a specific toast by ID
 * @param {string} toastId - The ID of the toast to dismiss
 */
export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
};

/**
 * Dismisses all active toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Promise-based toast for async operations
 * @param {Promise} promise - The promise to track
 * @param {Object} messages - Object containing loading, success, and error messages
 * @returns {Promise} The original promise
 */
export const promiseToast = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || "Processing...",
      success: messages.success || "Operation completed successfully",
      error: messages.error || "Operation failed",
    },
    TOAST_CONFIG
  );
};

/**
 * Custom toast with full control
 * @param {string} message - The message to display
 * @param {Object} config - Full toast configuration
 * @returns {string} Toast ID for programmatic control
 */
export const customToast = (message, config = {}) => {
  if (!message || typeof message !== "string") {
    console.warn("Toast message must be a non-empty string");
    return null;
  }

  return toast(message, {
    ...TOAST_CONFIG,
    ...config,
  });
};

// Legacy support - keeping the old typo for backward compatibility
export const sucessToast = successToast;
