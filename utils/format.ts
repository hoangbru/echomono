/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number | undefined): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export type DateFormatView = "full" | "yearOnly";

export function formatDate(
  date: string | Date,
  viewMode: DateFormatView = "full",
  options?: Intl.DateTimeFormatOptions,
): string {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "Không xác định";
  }

  const baseOptions: Intl.DateTimeFormatOptions =
    viewMode === "yearOnly"
      ? { year: "numeric" }
      : { year: "numeric", month: "long", day: "numeric" };

  return parsedDate.toLocaleDateString("vi-VN", {
    ...baseOptions,
    ...options,
  });
}

/**
 * Format duration in seconds to MM:SS
 */
export const formatDuration = (seconds: number | null) => {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const keysToCamel = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj;

  if (Array.isArray(obj)) return obj.map(keysToCamel);

  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

    newObj[camelKey] = keysToCamel(obj[key]);
  }
  return newObj;
};

/**
 * Format elapsed time in seconds
 * @param ms milliseconds
 * @returns formatted string like "5s"
 */
export const formatElapsed = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${s}s`;
};
