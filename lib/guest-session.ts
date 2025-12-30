/**
 * Guest Session Utilities
 * 
 * Manages guest sessions for the "try before you buy" flow.
 * Guests can create one exam before being prompted to register.
 */

const GUEST_ID_KEY = "examsim_guest_id";
const GUEST_EXAM_CREATED_KEY = "examsim_guest_exam_created";

/**
 * Generate a unique guest ID
 */
function generateGuestId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create a guest ID from localStorage
 */
export function getGuestId(): string {
    if (typeof window === "undefined") {
        return generateGuestId();
    }

    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        guestId = generateGuestId();
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
}

/**
 * Check if a guest ID exists
 */
export function hasGuestId(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(GUEST_ID_KEY);
}

/**
 * Mark that the guest has created an exam
 */
export function markGuestExamCreated(): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(GUEST_EXAM_CREATED_KEY, "true");
}

/**
 * Check if guest has already created an exam
 */
export function hasGuestCreatedExam(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(GUEST_EXAM_CREATED_KEY) === "true";
}

/**
 * Clear guest session data (called after successful registration)
 */
export function clearGuestSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_EXAM_CREATED_KEY);
}

/**
 * Get the current guest ID without creating a new one
 */
export function getExistingGuestId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(GUEST_ID_KEY);
}
