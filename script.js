window.dataLayer = window.dataLayer || [];

/* =========================================
    1. WINDOW MANAGEMENT
   ========================================= */
function openWindow(id) {
    const targetWindow = document.getElementById(id);
    if (targetWindow) {
        targetWindow.style.display = 'flex';

        // 1. Try to find the icon that was clicked
        const triggerIcon = document.querySelector(`[onclick*="${id}"]`);
        
        // 2. Grab Project Name: Prioritize the Icon, then the Window itself
        const projectName = (triggerIcon && triggerIcon.getAttribute('data-project-name')) || 
                            targetWindow.getAttribute('data-project-name') || 
                            'Unknown';

        // 3. Grab Window Type: Prioritize the Window attribute
        const windowType = targetWindow.getAttribute('data-window-type') || 'General';

        // DATA LAYER PUSH
        window.dataLayer.push({
            'event': 'portfolio_interaction',
            'event_type': 'window_open',
            'project_name': projectName,
            'window_type': windowType,
            'window_id': id
        });
        
        console.log(`✅ GTM Signal Sent: Opened ${projectName} (${windowType})`); 
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'none';
        
        // DATA LAYER INTEGRATION
        window.dataLayer.push({
            'event': 'portfolio_interaction',
            'event_type': 'window_close', // Precise trigger for "Close"
            'window_id': id
        });
    }
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

        // DATA LAYER INTEGRATION
        // Extracting filename from src to identify WHICH image was opened
        const imageName = src.split('/').pop();

        window.dataLayer.push({
            'event': 'gallery_interaction',
            'interaction_type': 'image_zoom',
            'image_src': src,
            'image_name': imageName // Precise trigger for specific images
        });
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';

        window.dataLayer.push({
            'event': 'gallery_interaction',
            'interaction_type': 'image_close'
        });
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
    
    // DATA LAYER INTEGRATION
    window.dataLayer.push({
        'event': 'tool_usage',
        'tool_name': 'calculator',
        'action': 'calculate',
        'input_expression': currentInput
    });

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
    
    if (!video || !canvas) return;

    // DATA LAYER INTEGRATION
    window.dataLayer.push({
        'event': 'tool_usage',
        'tool_name': 'camera',
        'action': 'take_photo'
    });

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
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
    8. SPOTIFY APP EXPERIENCE
   ========================================= */
function openSpotifyApp() {
    // Re-use your existing logic for consistency
    openWindow('case6-popup'); 
    
    // Explicit push for the "App" specific event
    window.dataLayer.push({
        'event': 'app_launch',
        'app_name': 'Spotify',
        'timestamp': new Date().toISOString()
    });
}

/* =========================================
    6. HELP TOAST
   ========================================= */
function showHelp() {
    const help = document.getElementById('help-popup');
    if (help) help.style.display = 'block';

    // DATA LAYER INTEGRATION
    window.dataLayer.push({
        'event': 'ui_interaction',
        'element': 'help_toast',
        'action': 'show'
    });

    setTimeout(closeHelp, 4000);
}
function closeHelp() {
    const help = document.getElementById('help-popup');
    if (help) help.style.display = 'none';
}

/* =========================================
    7. LEAD MAGNETS & UNLOCKING
   ========================================= */

function unlockCase5(event) {
    event.preventDefault();
    const emailInput = document.getElementById('case5-email');
    const email = emailInput ? emailInput.value : "Guest";
    const wrapper = document.getElementById('case5-content-wrapper');
    
    if (!wrapper) return;

    // DATA LAYER INTEGRATION (High-Value Conversion)
    window.dataLayer.push({
        'event': 'generate_lead',
        'form_id': 'case5-unlock-form',
        'form_name': 'Restricted Content Unlock',
        'project_context': 'Stealth Growth'
    });

    wrapper.style.transition = "opacity 0.4s ease, background-color 0.4s ease";
    wrapper.style.opacity = "0";

    setTimeout(() => {
        wrapper.style.backgroundColor = "#ffffff";
        wrapper.style.padding = "0";
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
                        Verification successful for <b>${email}</b>. Access granted.
                    </p>
                </div>
            </div>`;
        const title = document.querySelector('#case5-popup .window-title');
        if (title) title.textContent = "Case Study — Unlocked Content";
        wrapper.style.opacity = "1";
    }, 400);
}

function unlockAndCopyPrompt() {
    const email = document.getElementById('prompt-email').value;
    const btn = document.getElementById('btn-steal-prompt');
    
    if (email.includes('@')) {
        // DATA LAYER INTEGRATION (Conversion)
        window.dataLayer.push({
            'event': 'generate_lead',
            'form_id': 'lead-magnet-form',
            'form_name': 'AI Prompt Steal',
            'interaction_type': 'lead_magnet'
        });

        const mySecretPrompt = "Extremely realistic studio portrait photo of a woman with medium warm skin tone and visible acne-textured skin, including small active blemishes, healed acne marks, subtle redness, and natural uneven texture. Straight shoulder-length dark brown hair with a natural center part, slightly imperfect and softly textured. Calm, neutral expression with relaxed facial muscles. Natural human eyes with subtle asymmetry, soft lash density, imperfect eyebrows with individual hairs visible but not overly defined. No dramatic eye detail, no sharp contrast. Real skin texture with visible pores and natural shine, no smoothing, no airbrushing. Minimal or no makeup. Framed from mid-torso up. Plain light grey studio background. Soft diffused studio lighting, low contrast, gentle shadow falloff, natural color rendering. Shot on full-frame DSLR, 50mm lens, f/5.6 aperture, realistic depth of field, unretouched RAW photo look, documentary-style realism, natural color grading, true-to-life proportions, photorealistic"; 

        navigator.clipboard.writeText(mySecretPrompt);
        btn.innerHTML = "✅ Copied to Clipboard!";
        btn.style.background = "#27c93f";
    } else {
        alert("Enter your email to unlock the prompt.");
    }
}

/* =========================================
    8. INITIALIZATION & VIDEO TRACKING
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('mousedown', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // TRACKING FOR CASE 1 VIDEO (Precision Tracking)
    const case1Video = document.querySelector('#case1-popup video');
    if (case1Video) {
        case1Video.onplay = () => {
            window.dataLayer.push({
                'event': 'video_interaction',
                'action': 'play',
                'video_name': 'Husqvarna Case Study Video'
            });
        };
    }
});