/* =========================================
    0. ANALYTICS & DATA LAYER HELPER
   ========================================= */
function toggleWidget() {
    const widget = document.getElementById('engagement-widget');
    const icon = document.getElementById('toggle-icon');
    if (!widget || !icon) return;

    widget.classList.toggle('minimized');
    
    if (widget.classList.contains('minimized')) {
        icon.className = 'fa-solid fa-plus';
        sessionStorage.setItem('widget_minimized', 'true');
    } else {
        icon.className = 'fa-solid fa-minus';
        sessionStorage.setItem('widget_minimized', 'false');
    }
}

const engagementTasks = [
    'sos-trigger', 'seo-cheat-popup', 'lead-magnet', 'incoming-call',
    'tool-camera', 'tool-calculator', 'case5-popup'
];
let completedTasks = new Set();

/**
 * Updates the engagement score widget.
 * @param {string} taskId - The unique ID for the task completed.
 */
function trackEngagement(taskId) {
    if (completedTasks.has(taskId)) return;
    completedTasks.add(taskId);
    
    const score = Math.min(100, Math.round((completedTasks.size / engagementTasks.length) * 100));
    const bar = document.getElementById('score-bar');
    const text = document.getElementById('score-text');
    
    if (bar) bar.style.width = score + '%';
    if (text) text.textContent = score + '% of hidden tasks found';

    if (score === 100) {
        setTimeout(() => {
            const modal = document.getElementById('engagement-success-modal');
            if (modal) modal.style.display = 'flex';
            pushToDataLayer('engagement_milestone', { 'milestone': '100_percent_hidden' });
        }, 1200);
    }
}

/**
 * Pushes events to the Data Layer with consistent naming and structure.
 * @param {string} eventName - The name of the event (e.g., 'portfolio_interaction')
 * @param {object} eventData - Additional parameters for the event
 */
function pushToDataLayer(eventName, eventData = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': eventName,
        ...eventData,
        'timestamp': new Date().toISOString()
    });
    // Development logs can be commented out in production if needed
    // console.log(`[DataLayer] ${eventName}:`, eventData);
}

/* =========================================
    1. WINDOW MANAGEMENT
   ========================================= */
function openWindow(id, pushHistory = true) {
    const targetWindow = document.getElementById(id);
    if (targetWindow) {
        targetWindow.style.display = 'flex';

        // TRACK ENGAGEMENT
        if (engagementTasks.includes(id)) {
            trackEngagement(id);
        }

        // 1. Try to find the icon that was clicked
        const triggerIcon = document.querySelector(`[onclick*="${id}"]`);
        
        // 2. Grab Project Name: Prioritize the Icon, then the Window itself
        const projectName = (triggerIcon && triggerIcon.getAttribute('data-project-name')) || 
                            targetWindow.getAttribute('data-project-name') || 
                            'Unknown';

        // 3. Grab Window Type: Prioritize the Window attribute
        const windowType = targetWindow.getAttribute('data-window-type') || 'General';

        // 4. VIRTUAL ROUTING: Update URL without reload
        if (pushHistory) {
            const newUrl = window.location.pathname + '?window=' + id;
            window.history.pushState({ windowId: id }, '', newUrl);
        }

        // DATA LAYER PUSH (Refactored)
        pushToDataLayer('portfolio_interaction', {
            'event_type': 'window_open',
            'project_name': projectName,
            'window_type': windowType,
            'window_id': id
        });
        
        console.log(`✅ GTM Signal Sent: Opened ${projectName} (${windowType})`);

        // SPECIAL CASE: FACETIME TIMER
        if (id === 'facetime-video-popup') {
            startFaceTimeTimer();
        }

        // SPECIAL CASE: START CAMERA
        if (id === 'camera-popup') {
            startCamera();
        }
    }
}

let callInterval;
function startFaceTimeTimer() {
    const timerEl = document.getElementById('call-timer');
    if (timerEl) {
        let seconds = 0;
        clearInterval(callInterval);
        timerEl.textContent = "00:00"; // Reset view
        callInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            timerEl.textContent = `${mins}:${secs}`;
        }, 1000);
    }
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) {
        win.style.display = 'none';
        
        // VIRTUAL ROUTING: Reset URL
        if (window.history.state && window.history.state.windowId === id) {
            window.history.pushState({}, '', window.location.pathname);
        }

        // DATA LAYER INTEGRATION (Refactored)
        pushToDataLayer('portfolio_interaction', {
            'event_type': 'window_close', // Precise trigger for "Close"
            'window_id': id
        });

        // STOP TIMER IF FACETIME
        if (id === 'facetime-video-popup') {
            clearInterval(callInterval);
        }
    }
    if (id === 'camera-popup') stopCamera();
}

// HANDLE BROWSER BACK/FORWARD BUTTONS
window.onpopstate = function(event) {
    // Close all overlays first
    document.querySelectorAll('.window-overlay').forEach(el => el.style.display = 'none');
    clearInterval(callInterval); // stop facetime if running

    if (event.state && event.state.windowId) {
        openWindow(event.state.windowId, false); // Don't push history again
    }
};

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

        // DATA LAYER INTEGRATION (Refactored)
        // Extracting filename from src to identify WHICH image was opened
        const imageName = src.split('/').pop();

        pushToDataLayer('gallery_interaction', {
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

        // DATA LAYER INTEGRATION (Refactored)
        pushToDataLayer('gallery_interaction', {
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
    
    // TRACK ENGAGEMENT
    trackEngagement('tool-calculator');

    // DATA LAYER INTEGRATION (Refactored)
    pushToDataLayer('tool_usage', {
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
        // DATA LAYER INTEGRATION (Error Tracking)
        pushToDataLayer('tool_usage', {
            'tool_name': 'calculator',
            'action': 'error',
            'input_expression': currentInput
        });
        display.value = "Error";
        currentInput = "";
    }
}

/* =========================================
    5. CAMERA CONTROLS
   ========================================= */
let stream = null;

async function startCamera() {
    const video = document.getElementById('webcam');
    if (!video) return;

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
    } catch (err) {
        console.warn("Camera access declined or unavailable:", err);
        // We don't alert() here to keep the experience smooth; 
        // the user simply sees the placeholder/empty window.
    }
}

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

    // TRACK ENGAGEMENT
    trackEngagement('tool-camera');

    // DATA LAYER INTEGRATION (Refactored)
    pushToDataLayer('tool_usage', {
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
    
    // Explicit push for the "App" specific event (Refactored)
    pushToDataLayer('app_launch', {
        'app_name': 'Spotify'
    });
}

/* =========================================
    6. HELP TOAST
   ========================================= */
function showHelp() {
    const help = document.getElementById('help-popup');
    if (help) help.style.display = 'block';

    // TRACK ENGAGEMENT (Hidden Task)
    trackEngagement('sos-trigger');

    // DATA LAYER INTEGRATION (Refactored)
    pushToDataLayer('ui_interaction', {
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

    // DATA LAYER INTEGRATION (High-Value Conversion - Refactored)
    pushToDataLayer('generate_lead', {
        'form_id': 'case5-unlock-form',
        'form_name': 'Restricted Content Unlock',
        'project_context': 'Stealth Growth'
    });

    wrapper.style.transition = "opacity 0.4s ease, background-color 0.4s ease";
    wrapper.style.opacity = "0";

    setTimeout(() => {
        wrapper.style.backgroundColor = "#525659";
        wrapper.style.padding = "0";
        wrapper.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@300;400;700&display=swap');

                .pdf-body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    color: #333;
                    background-color: #525659;
                    animation: slideUpFade 0.8s ease forwards;
                }

                .pdf-page {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 25mm;
                    margin: 20px auto;
                    background: white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                @media (max-width: 210mm) {
                    .pdf-page {
                        width: 95%;
                        padding: 15mm;
                        min-height: auto;
                    }
                }

                .pdf-page h1 { font-size: 28pt; color: #1a1a1a; margin: 0 0 15pt 0; line-height: 1.1; border: none; }
                .pdf-page .subtitle { font-size: 14pt; color: #555; margin-bottom: 30pt; font-weight: 300; line-height: 1.4; }
                .pdf-page h2 { font-size: 18pt; color: #1a1a1a; margin-top: 0; border-bottom: 2px solid #1a1a1a; padding-bottom: 5pt; margin-bottom: 15pt; }
                .pdf-page h3 { font-size: 13pt; color: #007AFF; margin: 15pt 0 10pt 0; text-transform: uppercase; letter-spacing: 1px; }
                .pdf-page p, .pdf-page li { font-size: 11pt; line-height: 1.6; margin-bottom: 12pt; }
                
                .pdf-page .meta-box { border-left: 4px solid #007AFF; padding-left: 15pt; margin-bottom: 40pt; }
                .pdf-page .meta-text { font-size: 10pt; font-weight: bold; }

                .pdf-page table { width: 100%; border-collapse: collapse; margin: 15pt 0; }
                .pdf-page th { background: #1a1a1a; color: white; text-align: left; padding: 10pt; font-size: 10pt; }
                .pdf-page td { border: 1px solid #ddd; padding: 10pt; font-size: 10pt; vertical-align: top; }

                .pdf-page .footer {
                    margin-top: auto;
                    border-top: 1px solid #ddd;
                    padding-top: 10pt;
                    display: flex;
                    justify-content: space-between;
                    font-size: 9pt;
                    color: #888;
                }

                .pdf-page .cta-section {
                    background: #f4f4f4;
                    padding: 20pt;
                    border-radius: 10px;
                    text-align: center;
                    margin-top: 20pt;
                }

                .pdf-page .btn {
                    display: inline-block;
                    background: #007AFF;
                    color: white;
                    padding: 10pt 20pt;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 5px;
                    margin-top: 10pt;
                }
            </style>
            <div class="pdf-body">
                <div class="pdf-page">
                    <div class="meta-box">
                        <div class="meta-text">WHITE PAPER | GROWTH MARKETING</div>
                    </div>
                    <h1>The Zero-Party Data Revolution: Solving the Personalization-Privacy Paradox in Growth Marketing</h1>
                    <div class="subtitle">A Strategic Blueprint for Rebuilding Trust, Reclaiming ROI, and Delivering Hyper-Personalized Experiences in a world filled with privacy laws.</div>
                    
                    <p><strong>Date:</strong> Q2 2026<br><strong>Author:</strong> Alma Carlsson</p>
                    
                    <h2>Executive Summary</h2>
                    <p>The growth marketing engine of the last decade, built on a foundation of third-party cookies and covert data harvesting, has stalled. Consumers, now acutely aware of their digital footprint, are demanding both total privacy and extreme personalization—two seemingly incompatible desires. This Personalization-Privacy Paradox has left growth teams trapped between violating user trust and delivering generic, ineffective marketing.</p>
                    <p>Traditional tracking is dying. Regulations (GDPR/CCPA) and technology shifts (App Tracking Transparency) have blinded marketers. The result is a CAC-LTV crisis: Customer Acquisition Costs are soaring while Lifetime Value plummets because engagement is built on a foundation of poor-quality data.</p>
                    <p>This white paper argues that the solution is not more tracking, but a fundamental shift to a Zero-Party Data (0P) strategy. Zero-Party Data is information a customer intentionally and proactively shares with a brand. By adopting a value-exchange framework, growth teams can build a self-sustaining, trust-based data asset that powers hyper-personalization, reduces reliance on paid media, and future-proofs their growth.</p>
                    
                    <div class="footer">
                        <span>© 2026 Alma Carlsson</span>
                        <span>Page 1</span>
                    </div>
                </div>

                <div class="pdf-page">
                    <h2>The Nagging Problem: The Personalization-Privacy Paradox</h2>
                    <p>Growth marketers face a defining challenge: Consumers have split personalities.</p>
                    
                    <p><strong>The "Give Me Everything" Persona:</strong> Users expect brands to know their preferences instantly. They demand curated content, personalized product recommendations, and frictionless journeys. A generic email or irrelevant ad is seen as a sign of a lazy brand. According to a landmark study by McKinsey & Company, 71% of consumers expect companies to deliver personalized interactions, and 76% get frustrated when this doesn’t happen.</p>
                    
                    <p><strong>The "Don't Touch My Data" Persona:</strong> At the same time, users are terrified of surveillance. They reject "creepy" retargeting ads that follow them across the web based on a single search. They are proactively using ad-blockers, VPNs, and anti-tracking tools.</p>
                    
                    <h3>The Death of the Third-Party Ecosystem</h3>
                    <p>The industry responded to the privacy concern by breaking the old model. First-party cookies (data you collect on your own site) remain, but the core engine of growth—Third-Party Cookies (data collected by one company and sold to another)—is functionally extinct.</p>
                    
                    <ul>
                        <li><strong>Regulatory Hammers:</strong> GDPR (Europe) and CCPA (California) made covert data collection a high-risk legal liability.</li>
                        <li><strong>Technological Gates:</strong> Apple’s App Tracking Transparency (ATT) framework allows users to opt-out of cross-app tracking with a single tap. Google’s "Privacy Sandbox" has systematically dismantled user-level tracking in Chrome.</li>
                    </ul>

                    <p><strong>The result for Growth Marketers:</strong> We are flying blind. Our attribution models are broken, our retargeting audiences have shrunk by 60-80%, and our CAC is skyrocketing because we are forced to bid on generic, low-intent audiences. The standard growth loops of 2020 are now cash-burning liabilities.</p>

                    <div class="footer">
                        <span>© 2026 Alma Carlsson</span>
                        <span>Page 2</span>
                    </div>
                </div>

                <div class="pdf-page">
                    <h2>The High Cost of the Status Quo (The Leaky Bucket)</h2>
                    <p>Many companies are reacting to this crisis by trying to "hack" the system: using fingerprinting, probabilistic matching, or just spending more on the remaining paid channels (Meta/Google). This is a fatal strategic error for three reasons:</p>
                    
                    <h3>1. The Erosion of Brand Trust</h3>
                    <p>When a customer realizes a brand is tracking them without explicit consent, the relationship is instantly poisoned. A growth strategy based on stealth is a "short-term gain, long-term pain" model. Trust is the rarest and most valuable currency in 2026; violating it is an irreversible mistake.</p>
                    
                    <h3>2. The Accuracy Crisis: Modeling vs. Reality</h3>
                    <p>To replace lost user-level data, ad platforms now rely on conversion modeling (using AI to "guess" who converted). While better than nothing, modeled data is probabilistic, not deterministic. When you are making multi-million dollar budget decisions based on statistical guesses, your margin for error disappears. Growth becomes inefficient.</p>
                    
                    <h3>3. Data Deprecation as a Tax on Growth</h3>
                    <p>The primary source of truth for your growth marketing—the data—is deprecating in value every single day. This is a literal "tax" on your growth. If your data asset is 20% less accurate this year than last year, you must spend 20% more just to maintain the same acquisition rate. This is the CAC-LTV Death Spiral: your bucket is leaking faster than you can fill it.</p>
                    
                    <p>The status quo is not just uncomfortable; it is economically unsustainable. Growth teams need a new asset class.</p>

                    <div class="footer">
                        <span>© 2026 Alma Carlsson</span>
                        <span>Page 3</span>
                    </div>
                </div>

                <div class="pdf-page">
                    <h2>The Solution: The Zero-Party Data Revolution</h2>
                    <p>The solution is to stop trying to guess what consumers want and instead create a value-exchange where they happily tell you.</p>
                    
                    <h3>Defining Zero-Party Data (0P)</h3>
                    <p>Zero-Party Data is a concept popularized by Forrester Research. It is distinct from First-Party data.</p>
                    <p><strong>First-Party Data (1P):</strong> Behavioral data you collect based on a user's actions on your property (e.g., "User clicked on a blue pair of shoes," or "User visited the pricing page three times"). You own it, but you still have to infer intent.</p>
                    <p><strong>Zero-Party Data (0P):</strong> Data that a customer intentionally and proactively shares with you. This includes preference data, purchase intention, personal context, and how they want to be recognized by the brand. Examples: "I am looking for running shoes for a marathon (Intent)," or "I prefer sustainably-sourced materials (Preference)."</p>
                    
                    <h3>The Value-Exchange Framework (The Trust-Led Funnel)</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Stage</th>
                                <th>Action</th>
                                <th>Value Exchange (Ask vs. Offer)</th>
                                <th>Data Gained (0P)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Hook</td>
                                <td>Interactive Quiz</td>
                                <td>Ask: "Tell us about your hair type."<br>Offer: "Get a personalized 3-step routine."</td>
                                <td>Hair type, concerns, styling preference.</td>
                            </tr>
                            <tr>
                                <td>Nurture</td>
                                <td>Preference Center</td>
                                <td>Ask: "How often do you want to hear from us?"<br>Offer: "No spam, relevant updates."</td>
                                <td>Email frequency, topic preferences.</td>
                            </tr>
                            <tr>
                                <td>Commit</td>
                                <td>Account Creation</td>
                                <td>Ask: "Create a profile."<br>Offer: "Unlock exclusive loyalty rewards."</td>
                                <td>Birthday, demographic data, deep interests.</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footer">
                        <span>© 2026 Alma Carlsson</span>
                        <span>Page 4</span>
                    </div>
                </div>

                <div class="pdf-page">
                    <h2>Proof Points and Implementation</h2>
                    <h3>Supporting Evidence</h3>
                    <p>The power of Zero-Party data is backed by industry research. Forrester Research, the body that defined the term, emphasizes that 0P data allows for personalization that consumers actually welcome. In their analysis, they state that Zero-Party Data is crucial because it "is explicit data that is volunteered by the consumer... It’s the closest you can get to sitting across the table from a customer and asking them what they like." (Source: Forrester, Fatigue, Frustration, and The Path to Zero-Party Data, 2021).</p>
                    
                    <h3>Implementation Blueprint: Your 90-Day Roadmap</h3>
                    <p><strong>Day 1–30: The Zero-Party Audit</strong><br>Identify all points in your current customer journey where you can replace inferred (creepy) data with declared (volunteered) data.</p>
                    <p><strong>Day 31–60: Deploy Value-Exchange Tests</strong><br>Launch low-friction interactive experiences: a product recommender quiz, a onboarding survey, or an interactive preference center.</p>
                    <p><strong>Day 61–90: Activate the Data Moat</strong><br>Integrate your 0P data sources with your CRM and Marketing Automation (e.g., Klaviyo/Braze). Begin segments based only on declared preferences.</p>

                    <div class="cta-section">
                        <h2 style="border:none; margin-bottom:5pt;">Conclusion</h2>
                        <p>By shifting to a Zero-Party Data strategy, growth teams solve the Personalization-Privacy Paradox. Join the Zero-Party revolution and own your data future.</p>
                        <a href="#" class="btn">Download this template to create your zero-data-strategy today</a>
                    </div>

                    <div class="footer">
                        <span>© 2026 Alma Carlsson</span>
                        <span>Page 5</span>
                    </div>
                </div>
            </div>
        `;
        const title = document.querySelector('#case5-popup .window-title');
        if (title) title.textContent = "Zero-Party Data White Paper — Alma Carlsson";
        wrapper.style.opacity = "1";
    }, 400);
}

function unlockAndCopyPrompt() {
    const email = document.getElementById('prompt-email').value;
    const btn = document.getElementById('btn-steal-prompt');
    
    if (email.includes('@')) {
        // TRACK ENGAGEMENT (Hidden Task)
        trackEngagement('lead-magnet');

        // DATA LAYER INTEGRATION (Conversion - Refactored)
        pushToDataLayer('generate_lead', {
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

    // RESTORE WIDGET STATE
    if (sessionStorage.getItem('widget_minimized') === 'true') {
        const widget = document.getElementById('engagement-widget');
        const icon = document.getElementById('toggle-icon');
        if (widget && icon) {
            widget.classList.add('minimized');
            icon.className = 'fa-solid fa-plus';
        }
    }

    // DEEP LINKING SUPPORT
    const urlParams = new URLSearchParams(window.location.search);
    const windowToOpen = urlParams.get('window');
    if (windowToOpen) {
        setTimeout(() => openWindow(windowToOpen, false), 500);
    }

    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.addEventListener('mousedown', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // TRACKING FOR CASE 1 VIDEO (Precision Tracking - Refactored)
    const case1Video = document.querySelector('#case1-popup video');
    if (case1Video) {
        case1Video.onplay = () => {
            pushToDataLayer('video_interaction', {
                'action': 'play',
                'video_name': 'Husqvarna Case Study Video'
            });
        };
    }

    // 1. TRACK MENU BAR (Curiosity Check)
    document.querySelectorAll('.left-menu span[data-nav]').forEach(item => {
        item.addEventListener('click', () => {
            // Avoid double tracking if it already has showHelp()
            if (item.getAttribute('data-nav') === 'help') return; 
            
            pushToDataLayer('ui_interaction', {
                'element': 'top_menu',
                'action': 'click',
                'label': item.getAttribute('data-nav')
            });
        });
    });

    // 2. TRACK DOCK (Conversions & Easter Eggs)
    document.querySelectorAll('.dock-item[data-interaction]').forEach(item => {
        item.addEventListener('click', () => {
            pushToDataLayer('ui_interaction', {
                'element': 'dock',
                'action': item.getAttribute('data-interaction'),
                'label': item.getAttribute('data-dock-item'),
                'destination_url': item.getAttribute('href') || 'internal'
            });
        });
    });

    // 3. MACOS INCOMING CALL LOGIC (8-Click Trigger)
    let clickCount = 0;
    const notif = document.getElementById('incoming-call-notification');

    document.addEventListener('click', (e) => {
        // TRIGGER NOTIFICATION (Only once per session)
        if (sessionStorage.getItem('call_triggered')) return;

        clickCount++;
        if (clickCount === 8) {
            sessionStorage.setItem('call_triggered', 'true');
            if (notif) notif.style.display = 'block';

            // TRACK ENGAGEMENT
            trackEngagement('incoming-call');

            // GTM PUSH: Trigger Event
            pushToDataLayer('ui_interaction', {
                'element': 'incoming_call',
                'action': 'show',
                'trigger_type': '8_click_threshold'
            });
        }
    });

    // Accept Button
    const btnAccept = document.getElementById('btn-accept-call');
    if (btnAccept) {
        btnAccept.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop from counting as a site click
            if (notif) notif.style.display = 'none';
            
            // 1. Show the FaceTime Window
            openWindow('facetime-video-popup');
            
            // GTM PUSH: Accept Conversion (Interactive FaceTime)
            pushToDataLayer('ui_interaction', {
                'element': 'incoming_call',
                'action': 'accept_facetime',
                'interaction_type': 'simulated_call'
            });
        });
    }

    // Decline Button
    const btnDecline = document.getElementById('btn-decline-call');
    if (btnDecline) {
        btnDecline.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop from counting as a site click
            if (notif) notif.style.display = 'none';

            // GTM PUSH: Decline Interaction
            pushToDataLayer('ui_interaction', {
                'element': 'incoming_call',
                'action': 'decline'
            });
        });
    }

    // SIGNAL: PAGE READY (Best Practice)
    pushToDataLayer('dom_ready', {
        'page_title': document.title,
        'page_path': window.location.pathname
    });
});