/* =========================================
    1. WINDOW MANAGEMENT
   ========================================= */
async function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'flex';
    
    if (id === 'camera-popup') {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById('webcam');
            if (video) video.srcObject = stream;
        } catch (err) {
            console.error("Camera error:", err);
            alert("Camera access denied.");
        }
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) win.style.display = 'none';
    if (id === 'camera-popup') stopCamera();
}

/* =========================================
    2. LIGHTBOX (PINTEREST GRID)
   ========================================= */
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

/* =========================================
    3. SYSTEM CLOCK
   ========================================= */
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (!clockElement) return;
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    clockElement.textContent = now.toLocaleString('en-US', options).replace(/,/g, '');
}

/* =========================================
    4. CALCULATOR LOGIC
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
    try {
        const response = await fetch(`https://api.mathjs.org/v4/?expr=${encodeURIComponent(currentInput)}`);
        const result = await response.text();
        if (result.toLowerCase().includes("error")) throw new Error();
        display.value = result;
        currentInput = result; 
    } catch (error) {
        display.value = "Error";
        currentInput = "";
    }
}

/* =========================================
    5. CAMERA CONTROLS
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
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    video.style.filter = "brightness(3)";
    setTimeout(() => {
        video.style.filter = "brightness(1)";
        const link = document.createElement('a');
        link.download = 'my-portfolio-shot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }, 100);
}

/* =========================================
    6. INITIALIZATION
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
});

function showHelp() {
    const help = document.getElementById('help-popup');
    if (help) help.style.display = 'block';
    setTimeout(closeHelp, 4000);
}
function closeHelp() {
    const help = document.getElementById('help-popup');
    if (help) help.style.display = 'none';
}

/* =========================================
    7. LEAD MAGNETS & UNLOCKING
   ========================================= */

// Standard Lead Magnet (e.g., Space Game/General)
function handleLeadSubmit(event) {
    event.preventDefault();
    const emailInput = event.target.querySelector('input');
    const email = emailInput.value;
    const container = document.querySelector('.gate-overlay');
    
    container.style.opacity = '0';
    
    setTimeout(() => {
        container.innerHTML = `
            <div style="color: #00ff41; font-family: 'Courier New', monospace; animation: slideUpFade 0.5s ease forwards;">
                <div style="font-size: 60px; margin-bottom: 20px;">🚀</div>
                <h2 style="letter-spacing: 2px;">ACCESS REQUESTED</h2>
                <p style="color: #fff; margin-top: 15px; line-height: 1.5;">
                    Encryption key generated.<br>
                    Verification sent to:<br>
                    <span style="color: #00ff41; font-weight: bold;">${email}</span>
                </p>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">WELCOME TO THE FLEET, COMMANDER.</p>
            </div>
        `;
        container.style.opacity = '1';
    }, 300);
}

// Case 5 Specific Unlock Logic
function unlockCase5(event) {
    event.preventDefault();
    const email = document.getElementById('case5-email').value;
    const wrapper = document.getElementById('case5-content-wrapper');
    
    wrapper.style.transition = "opacity 0.4s ease";
    wrapper.style.opacity = "0";

    setTimeout(() => {
        wrapper.innerHTML = `
            <div class="unlocked-content" style="padding: 0; animation: slideUpFade 0.8s ease forwards;">
                <div class="window-content">
                    <h1 style="margin-bottom:20px;">Secret Project: Stealth Mode</h1>
                    <div class="image-placeholder" style="height: 250px; background: #eee; display: flex; align-items: center; justify-content: center; color: #999; border-radius:12px;">
                        [Project Analysis Image]
                    </div>
                    
                    <div class="project-text">
                        <h3>The Strategy</h3>
                        <p>Now that you've unlocked this, you can see the depth of the project. This area can be used to showcase your most sensitive or high-value growth experiments.</p>
                        
                        <h3>Key Results</h3>
                        <ul>
                            <li>Metric A: +120% increase in conversion</li>
                            <li>Metric B: -30% reduction in CPA</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        const title = document.querySelector('#case5-popup .window-title');
        if (title) title.textContent = "Case: Unlocked Project";
        
        wrapper.style.opacity = "1";
    }, 400);
}