// ===== Carousel for Comparison Videos =====
let currentVideo = 0;
const videoSlides = document.querySelectorAll('.comparison-slide');
const videoIndicators = document.querySelectorAll('.comparison-section .indicator');

function playCurrentSlideVideo() {
    // Pause all videos, then play the active one
    document.querySelectorAll('.comparison-slide video').forEach(v => { v.pause(); v.currentTime = 0; });
    const activeSlide = document.querySelector('.comparison-slide.active');
    if (activeSlide) {
        const video = activeSlide.querySelector('video');
        if (video) video.play().catch(() => {});
    }
}

function changeVideo(direction) {
    if (videoSlides.length === 0) return;
    videoSlides[currentVideo].classList.remove('active');
    videoIndicators[currentVideo].classList.remove('active');
    currentVideo += direction;
    if (currentVideo >= videoSlides.length) currentVideo = 0;
    else if (currentVideo < 0) currentVideo = videoSlides.length - 1;
    videoSlides[currentVideo].classList.add('active');
    videoIndicators[currentVideo].classList.add('active');
    playCurrentSlideVideo();
}

function setVideo(index) {
    if (videoSlides.length === 0) return;
    videoSlides[currentVideo].classList.remove('active');
    videoIndicators[currentVideo].classList.remove('active');
    currentVideo = index;
    videoSlides[currentVideo].classList.add('active');
    videoIndicators[currentVideo].classList.add('active');
    playCurrentSlideVideo();
}

// ===== Zoom Comparison Viewer =====
// Coordinates from paper TikZ: x=left%, y=bottom%, w=width%, h=height%
// CSS top = 100 - y - h
const sceneData = [
    { id: '000077', left: 65, top: 40,  width: 5,   height: 30, label: 'Pedestrian missed by DA2' },
    { id: '000044', left: 63, top: 20,  width: 10,  height: 30, label: 'Three distant tree trunks' },
    { id: '000010', left: 41, top: 39,  width: 3.2, height: 16, label: 'Distant vehicle' },
    { id: '000099', left: 30, top: 40,  width: 5,   height: 16, label: 'Roadside traffic sign' },
];

let currentScene = 0;
let overlayRedBoxVisible = true;

function setScene(index) {
    currentScene = index;
    const scene = sceneData[index];
    const prefix = `/projects/flexdepth/assets/imgs/depth_compare/${scene.id}_`;
    const t = '?t=' + Date.now();

    // Update images (timestamp to bypass cache)
    document.getElementById('zoomOriginal').src = prefix + 'original.png' + t;
    document.getElementById('compVitL518').src = prefix + 'vitl_518.png' + t;
    document.getElementById('compVitL644').src = prefix + 'vitl_644.png' + t;
    document.getElementById('compVitS518').src = prefix + 'vits_518.png' + t;
    document.getElementById('compVitS644').src = prefix + 'vits_644.png' + t;
    document.getElementById('compOurs').src = prefix + 'oursx.png' + t;

    // Update zoom rectangle (corrected positions)
    const zoomRectEl = document.getElementById('zoomRect');
    zoomRectEl.style.left = scene.left + '%';
    zoomRectEl.style.top = scene.top + '%';
    zoomRectEl.style.width = scene.width + '%';
    zoomRectEl.style.height = scene.height + '%';

    // Update scene buttons
    document.querySelectorAll('.scene-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.scene-btn')[index].classList.add('active');

    // Update overlay
    updateZoomOverlay(index);
}

function updateZoomOverlay(index) {
    const scene = sceneData[index];
    const prefix = `/projects/flexdepth/assets/imgs/depth_compare/${scene.id}_`;
    const t = '?t=' + Date.now();
    const rectClass = overlayRedBoxVisible ? 'overlay-zoom-rect' : 'overlay-zoom-rect hidden';
    const rectStyle = `left:${scene.left}%;top:${scene.top}%;width:${scene.width}%;height:${scene.height}%;`;
    const grid = document.getElementById('zoomOverlayGrid');
    grid.innerHTML = `
        <div class="zoom-overlay-item">
            <div class="zoom-overlay-label">DA2 ViT-L (1722&times;518)</div>
            <div style="position:relative;">
                <img src="${prefix}vitl_518.png${t}" alt="DA2 ViT-L 518">
                <div class="${rectClass}" style="${rectStyle}"></div>
            </div>
        </div>
        <div class="zoom-overlay-item">
            <div class="zoom-overlay-label">DA2 ViT-L (644&times;196)</div>
            <div style="position:relative;">
                <img src="${prefix}vitl_644.png${t}" alt="DA2 ViT-L 644">
                <div class="${rectClass}" style="${rectStyle}"></div>
            </div>
        </div>
        <div class="zoom-overlay-item">
            <div class="zoom-overlay-label">DA2 ViT-S (1722&times;518)</div>
            <div style="position:relative;">
                <img src="${prefix}vits_518.png${t}" alt="DA2 ViT-S 518">
                <div class="${rectClass}" style="${rectStyle}"></div>
            </div>
        </div>
        <div class="zoom-overlay-item">
            <div class="zoom-overlay-label">DA2 ViT-S (644&times;196)</div>
            <div style="position:relative;">
                <img src="${prefix}vits_644.png${t}" alt="DA2 ViT-S 644">
                <div class="${rectClass}" style="${rectStyle}"></div>
            </div>
        </div>
        <div class="zoom-overlay-item ours-overlay">
            <div class="zoom-overlay-label">Flex-X-Large (Ours)</div>
            <div style="position:relative;">
                <img src="${prefix}oursx.png${t}" alt="Flex-X-Large">
                <div class="${rectClass}" style="${rectStyle}"></div>
            </div>
        </div>
    `;
    document.getElementById('zoomOverlayTitle').textContent = scene.label;
}

function toggleOverlayRedBox() {
    overlayRedBoxVisible = !overlayRedBoxVisible;
    const btn = document.getElementById('toggleRedBox');
    btn.classList.toggle('active', overlayRedBoxVisible);
    document.querySelectorAll('.overlay-zoom-rect').forEach(el => {
        el.classList.toggle('hidden', !overlayRedBoxVisible);
    });
}

function openZoomOverlay() {
    document.getElementById('zoomOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeZoomOverlay() {
    document.getElementById('zoomOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Video Fullscreen =====
function toggleVideoFullscreen(btn) {
    const video = btn.parentElement.querySelector('video');
    if (!video) return;
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        video.requestFullscreen().catch(() => {
            // Fallback: try the wrapper
            btn.parentElement.requestFullscreen();
        });
    }
}

document.addEventListener('fullscreenchange', function() {
    document.querySelectorAll('.video-fullscreen-btn i').forEach(icon => {
        icon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
    });
});

// ===== Copy Citation =====
function copyCitation(btn) {
    const code = document.getElementById('citationCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

// ===== Image Lightbox =====
function openLightbox(imgEl) {
    document.getElementById('lightboxImg').src = imgEl.src;
    document.getElementById('imgLightbox').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('imgLightbox').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            // Update active nav link
            document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => a.classList.remove('active'));
            this.classList.add('active');

            const offset = 88;
            const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });
});

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    let currentId = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) {
            currentId = sec.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
}, { passive: true });

// ===== Keyboard =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') changeVideo(-1);
    else if (e.key === 'ArrowRight') changeVideo(1);
    else if (e.key === 'Escape') { closeZoomOverlay(); closeLightbox(); }
});

// ===== Touch Swipe =====
let touchStartX = 0;
document.addEventListener('touchstart', function(e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
document.addEventListener('touchend', function(e) {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) changeVideo(diff > 0 ? 1 : -1);
});

// ===== Scroll Animations =====
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '-40px', threshold: 0.05 });

    elements.forEach(el => observer.observe(el));
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    // Initialize first scene rect
    setScene(0);
});
