/**
 * MacBook Portfolio Simulation
 * Vanilla JS logic for interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const icons = document.querySelectorAll('.desktop-icon');

    // Add a simple "active" state simulation for Mac-like feel
    icons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            // Optional: prevent default if you want to add a 
            // "double click" requirement like a real desktop
            // e.preventDefault();
            console.log(`GTM Event Triggered: ${this.getAttribute('data-gtm')}`);
        });
    });

    // Prevent right-click context menu to enhance "App" feel (Optional)
    /*
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    }, false);
    */
});