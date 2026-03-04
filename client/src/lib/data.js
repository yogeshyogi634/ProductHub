// Product data from API - PRODUCTS is now dynamically loaded
import { productApi } from "./api";

// This will be populated dynamically
export let PRODUCTS = ["Collectbot", "ProfileX", "Perkle", "Svitch", "Blutic", "Neokred"]; // Fallback

// Function to load products from API
export async function loadProducts() {
    try {
        const products = await productApi.getProducts();
        PRODUCTS = products;
        return products;
    } catch (error) {
        console.error("Failed to load products from API:", error);
        return PRODUCTS; // Return fallback
    }
}

export const CURRENT_USER = {
    email: "madhav@neokred.tech",
    name: "Madhav",
};

export function formatDateTime(date = new Date()) {
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
    const d = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
    return `${time} | ${d}`;
}

/**
 * Check if a postedDate string like "02:45 PM | 12 Feb 2026"
 * falls within a date range [startFilter, endFilter].
 * If only startFilter is set, matches that exact day.
 * Returns true if no filter is set (both null/undefined).
 */
export function matchesDateFilter(postedDate, startFilter, endFilter) {
    if (!startFilter && !endFilter) return true;
    if (!postedDate) return false;
    // Extract the date part after " | "
    const parts = postedDate.split(" | ");
    if (parts.length < 2) return false;
    const datePart = parts[1].trim(); // e.g. "12 Feb 2026"
    const parsed = new Date(datePart);
    if (isNaN(parsed.getTime())) return false;
    // Format parsed date as YYYY-MM-DD
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const dd = String(parsed.getDate()).padStart(2, "0");
    const itemDate = `${yyyy}-${mm}-${dd}`;

    if (startFilter && endFilter) {
        return itemDate >= startFilter && itemDate <= endFilter;
    }
    // Only start set — match that single day
    if (startFilter) return itemDate === startFilter;
    return true;
}
