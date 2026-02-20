function openWindow(id) {
    const win = document.getElementById(id);
    if (win) win.style.display = 'flex';
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) win.style.display = 'none';
}

function updateClock() {
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;
    
    const now = new Date();
    const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    };
    // Format: Fri 20 Feb 19:12
    clockElement.innerText = now.toLocaleString('en-GB', options).replace(',', '');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("MacBook Desktop Loaded Successfully.");
    
    // Initial clock call and start interval
    updateClock();
    setInterval(updateClock, 1000);

    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log("Tracking Event:", icon.getAttribute('data-gtm') || icon.id);
        });
    });
});