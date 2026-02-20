function openWindow(id) {
    const win = document.getElementById(id);
    if (win) win.style.display = 'flex';
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) win.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("MacBook Desktop Loaded Successfully.");
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log("Tracking Event:", icon.getAttribute('data-gtm') || icon.id);
        });
    });
});