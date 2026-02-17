// lib/supabase-queries.js

// ── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
    { id: "p0", name: "Perkle" },
    { id: "p1", name: "Credit Card" },
    { id: "p2", name: "Loan Management" },
    { id: "p3", name: "Payment Gateway" },
];

let MOCK_UPDATES = [
    {
        id: "u1",
        product_id: "p1",
        title: "New Interest Rates",
        description: "Updated interest rates for Q3.",
        status: "Live",
        department: "Finance",
        author_email: "admin@neokred.tech",
        created_at: new Date().toISOString(),
        update_status_log: [],
    },
    {
        id: "u2",
        product_id: "p2",
        title: "Bug Fix in Repayment",
        description: "Fixed calculation error in repayment schedule.",
        status: "In Progress",
        department: "Engineering",
        author_email: "dev@neokred.tech",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        update_status_log: [],
    },
];

let MOCK_FEEDBACK = [
    {
        id: "f1",
        product_id: "p1",
        author_name: "John Doe",
        author_email: "john@client.com",
        content: "Great service!",
        likes: 5,
        liked_by: [],
        created_at: new Date().toISOString(),
        feedback_replies: [],
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function formatSupabaseDate(isoString) {
    const date = new Date(isoString);
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

async function simulateDelay(ms = 500) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Products ──────────────────────────────────────────────────────────────

export async function fetchProducts() {
    await simulateDelay();
    return MOCK_PRODUCTS;
}

// Helper: get product ID by name
async function getProductId(productName) {
    const product = MOCK_PRODUCTS.find((p) => p.name === productName);
    if (!product) throw new Error(`Product not found: ${productName}`);
    return product.id;
}

// ── Updates ───────────────────────────────────────────────────────────────

export async function fetchUpdates(productName) {
    await simulateDelay();
    const productId = await getProductId(productName);
    const updates = MOCK_UPDATES.filter((u) => u.product_id === productId).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return updates.map((u) => ({
        id: u.id,
        product: productName,
        title: u.title,
        description: u.description || "",
        status: u.status,
        department: u.department || "",
        departmentType: u.department || "",
        authorEmail: u.author_email,
        postedDate: formatSupabaseDate(u.created_at),
        statusLog: (u.update_status_log || [])
            .sort((a, b) => new Date(a.changed_at) - new Date(b.changed_at))
            .map((log) => ({
                from: log.from_status,
                to: log.to_status,
                date: new Date(log.changed_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
            })),
    }));
}

export async function createUpdate(productName, data) {
    await simulateDelay();
    const productId = await getProductId(productName);
    const newUpdate = {
        id: `u${MOCK_UPDATES.length + 1}`,
        product_id: productId,
        title: data.title,
        description: data.description,
        status: data.status,
        department: data.department,
        author_email: data.authorEmail,
        created_at: new Date().toISOString(),
        update_status_log: [],
    };
    MOCK_UPDATES.unshift(newUpdate);

    return {
        id: newUpdate.id,
        product: productName,
        title: newUpdate.title,
        description: newUpdate.description || "",
        status: newUpdate.status,
        department: newUpdate.department || "",
        departmentType: newUpdate.department || "",
        authorEmail: newUpdate.author_email,
        postedDate: formatSupabaseDate(newUpdate.created_at),
        statusLog: [],
    };
}

export async function editUpdate(updateId, data, oldStatus) {
    await simulateDelay();
    const updateIndex = MOCK_UPDATES.findIndex((u) => u.id === updateId);
    if (updateIndex === -1) throw new Error("Update not found");

    MOCK_UPDATES[updateIndex] = {
        ...MOCK_UPDATES[updateIndex],
        title: data.title,
        description: data.description,
        status: data.status,
        department: data.department,
    };

    if (oldStatus && oldStatus !== data.status) {
        MOCK_UPDATES[updateIndex].update_status_log.push({
            id: `log${Date.now()}`,
            from_status: oldStatus,
            to_status: data.status,
            changed_at: new Date().toISOString(),
        });
    }
}

export async function removeUpdate(updateId) {
    await simulateDelay();
    MOCK_UPDATES = MOCK_UPDATES.filter((u) => u.id !== updateId);
}

// ── Feedback ──────────────────────────────────────────────────────────────

export async function fetchFeedback(productName) {
    await simulateDelay();
    const productId = await getProductId(productName);
    const feedback = MOCK_FEEDBACK.filter((f) => f.product_id === productId).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return feedback.map((f) => ({
        id: f.id,
        product: productName,
        authorName: f.author_name,
        authorEmail: f.author_email,
        isAnonymous: false,
        content: f.content,
        postedDate: formatSupabaseDate(f.created_at),
        likes: f.likes || 0,
        likedBy: f.liked_by || [],
        comments: (f.feedback_replies || [])
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map((r) => ({
                id: r.id,
                authorName: r.author_name,
                authorEmail: r.author_email,
                isAnonymous: false,
                content: r.content,
                postedDate: formatSupabaseDate(r.created_at),
            })),
    }));
}

export async function createFeedback(productName, authorName, authorEmail, content) {
    await simulateDelay();
    const productId = await getProductId(productName);
    const newFeedback = {
        id: `f${MOCK_FEEDBACK.length + 1}`,
        product_id: productId,
        author_name: authorName,
        author_email: authorEmail,
        content,
        likes: 0,
        liked_by: [],
        created_at: new Date().toISOString(),
        feedback_replies: [],
    };
    MOCK_FEEDBACK.unshift(newFeedback);

    return {
        id: newFeedback.id,
        product: productName,
        authorName: newFeedback.author_name,
        authorEmail: newFeedback.author_email,
        isAnonymous: false,
        content: newFeedback.content,
        postedDate: formatSupabaseDate(newFeedback.created_at),
        likes: 0,
        likedBy: [],
        comments: [],
    };
}

export async function removeFeedback(feedbackId) {
    await simulateDelay();
    MOCK_FEEDBACK = MOCK_FEEDBACK.filter((f) => f.id !== feedbackId);
}

export async function toggleLikeOnFeedback(feedbackId, email) {
    await simulateDelay();
    const feedbackIndex = MOCK_FEEDBACK.findIndex((f) => f.id === feedbackId);
    if (feedbackIndex === -1) throw new Error("Feedback not found");

    const feedback = MOCK_FEEDBACK[feedbackIndex];
    const likedBy = feedback.liked_by || [];
    const alreadyLiked = likedBy.includes(email);

    const newLikedBy = alreadyLiked
        ? likedBy.filter((e) => e !== email)
        : [...likedBy, email];
    const newLikes = alreadyLiked ? feedback.likes - 1 : feedback.likes + 1;

    MOCK_FEEDBACK[feedbackIndex] = {
        ...feedback,
        likes: newLikes,
        liked_by: newLikedBy,
    };

    return { likes: newLikes, likedBy: newLikedBy };
}

export async function createReply(feedbackId, authorName, authorEmail, content) {
    await simulateDelay();
    const feedbackIndex = MOCK_FEEDBACK.findIndex((f) => f.id === feedbackId);
    if (feedbackIndex === -1) throw new Error("Feedback not found");

    const newReply = {
        id: `r${Date.now()}`,
        feedback_id: feedbackId,
        author_name: authorName,
        author_email: authorEmail,
        content,
        created_at: new Date().toISOString(),
    };

    if (!MOCK_FEEDBACK[feedbackIndex].feedback_replies) {
        MOCK_FEEDBACK[feedbackIndex].feedback_replies = [];
    }
    MOCK_FEEDBACK[feedbackIndex].feedback_replies.push(newReply);

    return {
        id: newReply.id,
        authorName: newReply.author_name,
        authorEmail: newReply.author_email,
        isAnonymous: false,
        content: newReply.content,
        postedDate: formatSupabaseDate(newReply.created_at),
    };
}
