/**
 * Utility for automatic responsive image optimization and CDN delivery.
 * Automatically injects Cloudinary auto-format (f_auto), quality (q_auto),
 * and width constraints to reduce image payload by up to 90%+.
 */
export const optimizeImage = (url?: string | null, width: number = 600): string => {
  if (!url || typeof url !== "string") {
    return "/placeholder.jpg";
  }

  // Optimize Cloudinary URLs with dynamic CDN transformations
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("f_auto") || url.includes("q_auto")) {
      return url;
    }
    const parts = url.split("/upload/");
    return `${parts[0]}/upload/f_auto,q_auto,w_${width},c_limit/${parts[1]}`;
  }

  return url;
};

export default optimizeImage;
