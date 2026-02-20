/**
 * Senior Developer Note:
 * GTM Click Trigger Info:
 * Trigger Type: Click - Just Links
 * Condition: Click ID equals 'icon-case1' (or use CSS selector #icon-case1)
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("MacBook Desktop Loaded Successfully.");

    // Selecting all icons for potential logic (like sounds or click effects)
    const icons = document.querySelectorAll('.desktop-icon');

    icons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            // Log for debugging GTM data attributes
            console.log("Tracking Event:", icon.getAttribute('data-gtm'));
        });
    });
});