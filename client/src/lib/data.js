// Mock data — swap this module's functions for real API calls later.
// Each exported function mirrors what an API service layer would return.

export const PRODUCTS = ["Perkle", "Blutic", "Collectbot", "ProfileX", "Svitch", "Neokred"];

export const CURRENT_USER = {
    email: "madhav@neokred.tech",
    name: "Madhav",
};

function ts(time, date) {
    return `${time} | ${date}`;
}

export const INITIAL_UPDATES = {
    Perkle: [
        {
            id: "perkle-1",
            product: "Perkle",
            title: "Payment Integration on Perkle",
            description:
                "We are integrating with our own payment gateway and from next quarter we will be integrating this to all our internal products.",
            status: "WIP",
            department: "Product",
            departmentType: "Product",
            authorEmail: "madhav@neokred.tech",
            postedDate: ts("02:45 PM", "12 Feb 2026"),
            statusLog: [],
        },
        {
            id: "perkle-2",
            product: "Perkle",
            title: "Rewards Dashboard Analytics",
            description:
                "Adding real-time analytics to the Perkle rewards dashboard so managers can track engagement and redemptions live.",
            status: "Completed",
            department: "Engineering",
            departmentType: "Engineering",
            authorEmail: "arjun@neokred.tech",
            postedDate: ts("10:00 AM", "11 Feb 2026"),
            statusLog: [
                { from: "Backlog", to: "WIP", date: "10 Feb 2026" },
                { from: "WIP", to: "Completed", date: "11 Feb 2026" },
            ],
        },
        {
            id: "perkle-3",
            product: "Perkle",
            title: "Mobile App Redesign",
            description:
                "Complete redesign of the Perkle mobile app with updated UX flows, new onboarding, and improved accessibility.",
            status: "Backlog",
            department: "Design",
            departmentType: "Design",
            authorEmail: "priya@neokred.tech",
            postedDate: ts("09:00 AM", "10 Feb 2026"),
            statusLog: [],
        },
    ],
    Blutic: [
        {
            id: "blutic-1",
            product: "Blutic",
            title: "Bulk Invoice Export Feature",
            description:
                "Users can now select multiple invoices and export them as a ZIP archive. Supports PDF and CSV formats.",
            status: "WIP",
            department: "Product",
            departmentType: "Product",
            authorEmail: "madhav@neokred.tech",
            postedDate: ts("11:30 AM", "12 Feb 2026"),
            statusLog: [],
        },
        {
            id: "blutic-2",
            product: "Blutic",
            title: "Tax Compliance Engine",
            description:
                "Automated GST calculation engine integrated with the invoice module.",
            status: "Backlog",
            department: "Finance",
            departmentType: "Finance",
            authorEmail: "neha@neokred.tech",
            postedDate: ts("03:00 PM", "09 Feb 2026"),
            statusLog: [],
        },
    ],
    Collectbot: [
        {
            id: "collectbot-1",
            product: "Collectbot",
            title: "CSV Auto-Verification",
            description:
                "Automating the manual cross-verification step during CSV upload by running field-level validation rules.",
            status: "WIP",
            department: "Engineering",
            departmentType: "Engineering",
            authorEmail: "madhav@neokred.tech",
            postedDate: ts("01:00 PM", "12 Feb 2026"),
            statusLog: [],
        },
        {
            id: "collectbot-2",
            product: "Collectbot",
            title: "WhatsApp Reminder Integration",
            description:
                "Automated payment reminders via WhatsApp Business API have been shipped to production.",
            status: "Completed",
            department: "Product",
            departmentType: "Product",
            authorEmail: "kiran@neokred.tech",
            postedDate: ts("04:00 PM", "08 Feb 2026"),
            statusLog: [
                { from: "Backlog", to: "WIP", date: "07 Feb 2026" },
                { from: "WIP", to: "Completed", date: "08 Feb 2026" },
            ],
        },
    ],
    ProfileX: [
        {
            id: "profilex-1",
            product: "ProfileX",
            title: "SSO Login Support",
            description:
                "Adding SAML-based Single Sign-On so enterprise clients can log in with their existing identity provider.",
            status: "Backlog",
            department: "Engineering",
            departmentType: "Engineering",
            authorEmail: "madhav@neokred.tech",
            postedDate: ts("10:15 AM", "11 Feb 2026"),
            statusLog: [],
        },
        {
            id: "profilex-2",
            product: "ProfileX",
            title: "Profile Completeness Score",
            description:
                "A gamified completeness score has been added to motivate users to fill in all profile fields.",
            status: "Completed",
            department: "Product",
            departmentType: "Product",
            authorEmail: "priya@neokred.tech",
            postedDate: ts("09:30 AM", "07 Feb 2026"),
            statusLog: [
                { from: "Backlog", to: "WIP", date: "06 Feb 2026" },
                { from: "WIP", to: "Completed", date: "07 Feb 2026" },
            ],
        },
    ],
    Svitch: [
        {
            id: "svitch-1",
            product: "Svitch",
            title: "Offline Mode Support",
            description:
                "Svitch app will now queue actions offline and sync automatically when connectivity is restored.",
            status: "WIP",
            department: "Engineering",
            departmentType: "Engineering",
            authorEmail: "madhav@neokred.tech",
            postedDate: ts("08:45 AM", "12 Feb 2026"),
            statusLog: [],
        },
        {
            id: "svitch-2",
            product: "Svitch",
            title: "Dark Mode",
            description:
                "System-level dark mode support is now live across all Svitch interfaces.",
            status: "Completed",
            department: "Design",
            departmentType: "Design",
            authorEmail: "arjun@neokred.tech",
            postedDate: ts("05:00 PM", "06 Feb 2026"),
            statusLog: [
                { from: "WIP", to: "Completed", date: "06 Feb 2026" },
            ],
        },
    ],
    Neokred: [
        {
            id: "neokred-1",
            product: "Neokred",
            title: "Unified Product Dashboard",
            description:
                "A single dashboard to monitor health metrics across all Neokred products — Perkle, Blutic, Collectbot, ProfileX, Svitch.",
            status: "WIP",
            department: "Product",
            departmentType: "Product",
            authorEmail: "madhav@neokred.tech",
            postedDate: ts("12:00 PM", "12 Feb 2026"),
            statusLog: [],
        },
        {
            id: "neokred-2",
            product: "Neokred",
            title: "Brand Refresh 2026",
            description:
                "Updating brand guidelines, logo suite, and color palette across all touchpoints.",
            status: "Backlog",
            department: "Design",
            departmentType: "Design",
            authorEmail: "priya@neokred.tech",
            postedDate: ts("02:00 PM", "10 Feb 2026"),
            statusLog: [],
        },
    ],
};

export const INITIAL_FEEDBACK = {
    Perkle: [
        {
            id: "pf-1",
            product: "Perkle",
            authorName: "Madhav",
            authorEmail: "madhav@neokred.tech",
            isAnonymous: false,
            content:
                "While uploading CSV, we are asked to cross-verify the info manually. Can we automate it?",
            postedDate: ts("02:45 PM", "12 Feb 2026"),
            likes: 5,
            likedBy: [],
            comments: [
                {
                    id: "pf-1-r1",
                    authorName: "Arjun",
                    authorEmail: "arjun@neokred.tech",
                    isAnonymous: false,
                    content: "This is already in the Collectbot WIP. Should be rolling out soon.",
                    postedDate: ts("03:10 PM", "12 Feb 2026"),
                },
            ],
        },
        {
            id: "pf-2",
            product: "Perkle",
            authorName: "Priya",
            authorEmail: "priya@neokred.tech",
            isAnonymous: false,
            content:
                "The rewards redemption page is slow to load. Can we add some caching?",
            postedDate: ts("01:30 PM", "11 Feb 2026"),
            likes: 3,
            likedBy: [],
            comments: [],
        },
    ],
    Blutic: [
        {
            id: "bf-1",
            product: "Blutic",
            authorName: "Kiran",
            authorEmail: "kiran@neokred.tech",
            isAnonymous: false,
            content: "Can we get a bulk delete option for old invoices? Cleaning up manually takes forever.",
            postedDate: ts("10:00 AM", "12 Feb 2026"),
            likes: 7,
            likedBy: [],
            comments: [],
        },
    ],
    Collectbot: [
        {
            id: "cf-1",
            product: "Collectbot",
            authorName: "Neha",
            authorEmail: "neha@neokred.tech",
            isAnonymous: false,
            content: "The reminder scheduling UI is confusing. A calendar picker would help a lot.",
            postedDate: ts("11:00 AM", "11 Feb 2026"),
            likes: 4,
            likedBy: [],
            comments: [],
        },
    ],
    ProfileX: [
        {
            id: "xf-1",
            product: "ProfileX",
            authorName: "Madhav",
            authorEmail: "madhav@neokred.tech",
            isAnonymous: false,
            content: "Searching by skills would make the directory much more useful.",
            postedDate: ts("09:00 AM", "10 Feb 2026"),
            likes: 2,
            likedBy: [],
            comments: [],
        },
    ],
    Svitch: [
        {
            id: "sf-1",
            product: "Svitch",
            authorName: "Arjun",
            authorEmail: "arjun@neokred.tech",
            isAnonymous: false,
            content: "The app crashes on older Android devices. Needs a fix ASAP.",
            postedDate: ts("08:00 AM", "12 Feb 2026"),
            likes: 9,
            likedBy: [],
            comments: [],
        },
    ],
    Neokred: [
        {
            id: "nf-1",
            product: "Neokred",
            authorName: "Priya",
            authorEmail: "priya@neokred.tech",
            isAnonymous: false,
            content: "Would love a changelog / release notes page so everyone stays informed.",
            postedDate: ts("04:30 PM", "09 Feb 2026"),
            likes: 6,
            likedBy: [],
            comments: [],
        },
    ],
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
