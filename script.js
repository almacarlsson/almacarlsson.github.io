/* =========================================
    1. WINDOW MANAGEMENT
   ========================================= */
async function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'flex';
    
    // Auto-start camera if camera popup is opened
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
        // Using mathjs API for processing calculations
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
    
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Flash effect
    video.style.filter = "brightness(3)";
    setTimeout(() => {
        video.style.filter = "brightness(1)";
        const link = document.createElement('a');
        link.download = 'alma-portfolio-shot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }, 100);
}

/* =========================================
    6. HELP TOAST
   ========================================= */
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
    7. LEAD MAGNETS & UNLOCKING (FIXED)
   ========================================= */

// Case 5 Specific Unlock Logic
function unlockCase5(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('case5-email');
    const email = emailInput ? emailInput.value : "Guest";
    const wrapper = document.getElementById('case5-content-wrapper');
    
    if (!wrapper) return;

    // 1. Fade out the black gate container
    wrapper.style.transition = "opacity 0.4s ease, background-color 0.4s ease";
    wrapper.style.opacity = "0";

    setTimeout(() => {
        // 2. Change wrapper from Black (Gate) to White (Content)
        wrapper.style.backgroundColor = "#ffffff";
        wrapper.style.padding = "0"; // Reset padding to handle it via the new div

        // 3. Inject the Unlocked Project Content
        wrapper.innerHTML = `
            <div class="unlocked-content" style="padding: 40px; animation: slideUpFade 0.8s ease forwards; color: #333;">
                <h1 style="margin-bottom:20px; color: #000; font-size: 2rem;">Project: Stealth Growth</h1>
                
                <div class="image-placeholder" style="height: 250px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #bbb; border-radius:12px; margin-bottom: 25px; border: 1px dashed #ccc;">
                    <div style="text-align:center;">
                        <i class="fa-solid fa-unlock-keyhole" style="font-size: 40px; margin-bottom:10px;"></i>
                        <p style="font-size: 14px;">Proprietary Data Visualization</p>
                    </div>
                </div>
                
                <div class="project-text">
                    <h3 style="color: #888; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">Project Overview</h3>
                    <p style="margin-top: 10px; line-height: 1.6; font-size: 1.05rem;">
                        Verification successful for <b>${email}</b>. Access granted to the performance marketing breakdown for this high-growth D2C experiment.
                    </p>
                    
                    <h3 style="color: #888; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; margin-top: 25px;">The Strategy</h3>
                    <p style="margin-top: 10px; line-height: 1.6;">
                        This project focused on a "Stealth Mode" launch, leveraging micro-influencer seeding and localized SEO clusters to gain a 14% market share within the first 6 months without traditional heavy ad spend.
                    </p>

                    <h3 style="color: #888; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; margin-top: 25px;">Key Results</h3>
                    <ul style="margin-top: 10px; padding-left: 20px; line-height: 1.8;">
                        <li><strong>ROAS:</strong> 4.2x average across all channels</li>
                        <li><strong>Retention:</strong> 32% increase in LTV (Life Time Value)</li>
                        <li><strong>Organic:</strong> Top 3 ranking for 12 primary keywords</li>
                    </ul>
                </div>
            </div>
        `;
        
        // 4. Update the header title to reflect the new state
        const title = document.querySelector('#case5-popup .window-title');
        if (title) title.textContent = "Case Study — Unlocked Content";
        
        // 5. Reveal everything
        wrapper.style.opacity = "1";
    }, 400);
}

// General Lead Magnet (Used for other items)
function handleLeadSubmit(event) {
    event.preventDefault();
    const emailInput = event.target.querySelector('input');
    const email = emailInput ? emailInput.value : "";
    const container = event.target.closest('.gate-overlay');
    
    if (container) {
        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = `
                <div style="color: #00ff41; font-family: 'Courier New', monospace; animation: slideUpFade 0.5s ease forwards;">
                    <div style="font-size: 60px; margin-bottom: 20px;">🚀</div>
                    <h2 style="letter-spacing: 2px;">ACCESS GRANTED</h2>
                    <p style="color: #fff; margin-top: 15px; line-height: 1.5;">
                        Verification sent to:<br>
                        <span style="color: #00ff41; font-weight: bold;">${email}</span>
                    </p>
                </div>
            `;
            container.style.opacity = '1';
        }, 300);
    }
}

/* =========================================
    8. INITIALIZATION
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
});