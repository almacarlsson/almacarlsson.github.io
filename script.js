/* =========================================
   1. WINDOW MANAGEMENT (Unified)
   ========================================= */

// Combined function to handle regular windows and camera logic
async function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = 'flex';
    
    // Specific logic for the Camera app
    if (id === 'camera-popup') {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById('webcam');
            if (video) {
                video.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("Camera access denied or not available.");
        }
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'none';
    }
    // If closing camera via general close, stop stream
    if (id === 'camera-popup') {
        stopCamera();
    }
}

/* =========================================
   2. SYSTEM CLOCK
   ========================================= */
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

    // Formats to: Sat Feb 21 16:12
    clockElement.textContent = now.toLocaleString('en-US', options).replace(/,/g, '');
}

/* =========================================
   3. CALCULATOR LOGIC
   ========================================= */
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
        const encodedExpr = encodeURIComponent(currentInput);
        const response = await fetch(`https://api.mathjs.org/v4/?expr=${encodedExpr}`);
        const result = await response.text();

        // Check if API returned an error string
        if (result.toLowerCase().includes("error")) throw new Error();

        display.value = result;
        currentInput = result; 
    } catch (error) {
        display.value = "Error";
        currentInput = "";
    }
}

/* =========================================
   4. CAMERA CONTROLS
   ========================================= */
let stream = null;

function stopCamera() {
    const win = document.getElementById('camera-popup');
    if (win) win.style.display = 'none';
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function takePhoto() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('photo-canvas');
    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Flash effect
    video.style.filter = "brightness(3)";
    setTimeout(() => {
        video.style.filter = "brightness(1)";
        const data = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'my-portfolio-shot.png';
        link.href = data;
        link.click();
    }, 100);
}

/* =========================================
   5. HELP / NOTIFICATIONS
   ========================================= */
function showHelp() {
    const help = document.getElementById('help-popup');
    if (!help) return;
    help.style.display = 'block';
    
    setTimeout(() => {
        closeHelp();
    }, 4000);
}

function closeHelp() {
    const help = document.getElementById('help-popup');
    if (help) help.style.display = 'none';
}

/* =========================================
   6. INITIALIZATION
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);

    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log("Viewing:", icon.id);
        });
    });
});

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    lightbox.style.display = 'flex';
    lightboxImg.src = src;
    
    // Optional: Prevent background scrolling while looking at the image
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    
    // Restore scrolling
    document.body.style.overflow = 'auto';
}