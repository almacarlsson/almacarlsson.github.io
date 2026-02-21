// Opens the window instantly
function openWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'flex';
    }
}

// Closes the window instantly
function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'none';
    }
}

// Handles the Mac-style clock in the menu bar
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;
    
    const now = new Date();
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    };

    // Format: Sat Feb 21 16:12
    clockElement.textContent = now.toLocaleString('en-US', options).replace(/,/g, '');
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);

    // Optional: Log which case is being opened to the console
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log("Viewing:", icon.id);
        });
    });
});

let currentInput = "";

function appendCalc(value) {
    currentInput += value;
    document.getElementById('calc-display').value = currentInput;
}

function clearCalc() {
    currentInput = "";
    document.getElementById('calc-display').value = "0";
}

function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    document.getElementById('calc-display').value = currentInput || "0";
}

async function calculateResult() {
    const display = document.getElementById('calc-display');
    if (!currentInput) return;

    try {
        // We encode the expression so symbols like '+' or '/' work in the URL
        const encodedExpr = encodeURIComponent(currentInput);
        const response = await fetch(`https://api.mathjs.org/v4/?expr=${encodedExpr}`);
        const result = await response.text();

        display.value = result;
        currentInput = result; // Allows you to keep calculating with the result
    } catch (error) {
        display.value = "Error";
        currentInput = "";
    }
}

let stream = null;

async function openWindow(id) {
    document.getElementById(id).style.display = 'flex';
    
    // If it's the camera window, start the video
    if (id === 'camera-popup') {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById('webcam');
            video.srcObject = stream;
        } catch (err) {
            alert("Camera access denied or not available.");
        }
    }
}

function stopCamera() {
    const win = document.getElementById('camera-popup');
    win.style.display = 'none';
    if (stream) {
        stream.getTracks().forEach(track => track.stop()); // Turns off the green camera light
    }
}

function takePhoto() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('photo-canvas');
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Flash effect
    video.style.filter = "brightness(3)";
    setTimeout(() => {
        video.style.filter = "brightness(1)";
        // Optional: Download the photo automatically
        const data = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'my-portfolio-shot.png';
        link.href = data;
        link.click();
    }, 100);
}

function showHelp() {
    const help = document.getElementById('help-popup');
    help.style.display = 'block';
    
    // It will disappear on its own after 4 seconds
    setTimeout(() => {
        closeHelp();
    }, 4000);
}

function closeHelp() {
    document.getElementById('help-popup').style.display = 'none';
}