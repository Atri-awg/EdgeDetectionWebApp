// ==================== APLIKASI UTAMA ====================
// File: app.js
// Fungsi: Mengatur UI, webcam, dan memproses gambar

// Global variables
let currentMode = 'webcam';
let isStreaming = false;
let stream = null;
let animationId = null;
let thresholdValue = 50;
let activeOperators = {
    sobel: true,
    roberts: true,
    prewitt: true,
    laplace: true,
    canny: true
};

// DOM Elements
const videoElement = document.getElementById('videoElement');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const uploadBtn = document.getElementById('uploadBtn');
const threshold = document.getElementById('threshold');

// Canvas elements
const canvases = {
    original: document.getElementById('originalCanvas'),
    sobel: document.getElementById('sobelCanvas'),
    roberts: document.getElementById('robertsCanvas'),
    prewitt: document.getElementById('prewittCanvas'),
    laplace: document.getElementById('laplaceCanvas'),
    canny: document.getElementById('cannyCanvas')
};

// ==================== MODE SWITCHING ====================
function switchMode(mode) {
    currentMode = mode;
    
    // Update button states
    document.getElementById('webcamModeBtn').classList.toggle('active', mode === 'webcam');
    document.getElementById('uploadModeBtn').classList.toggle('active', mode === 'upload');
    
    // Show/hide appropriate controls
    if (mode === 'webcam') {
        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
        uploadBtn.classList.add('hidden');
        stopWebcam();
    } else {
        startBtn.classList.add('hidden');
        stopBtn.classList.add('hidden');
        uploadBtn.classList.remove('hidden');
        stopWebcam();
    }
}

// ==================== WEBCAM CONTROL ====================
async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        
        videoElement.srcObject = stream;
        isStreaming = true;
        
        // Update button visibility
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        
        // Wait for video to load
        videoElement.onloadedmetadata = () => {
            videoElement.play();
            processVideoFrame();
        };
        
    } catch (err) {
        alert('Tidak dapat mengakses webcam: ' + err.message);
        console.error('Webcam error:', err);
    }
}

function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    isStreaming = false;
    
    // Update button visibility
    if (currentMode === 'webcam') {
        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
    }
}

// ==================== VIDEO FRAME PROCESSING ====================
function processVideoFrame() {
    if (!isStreaming || !videoElement.srcObject) {
        return;
    }
    
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    
    if (width === 0 || height === 0) {
        animationId = requestAnimationFrame(processVideoFrame);
        return;
    }
    
    // Draw original frame
    const originalCtx = canvases.original.getContext('2d');
    canvases.original.width = width;
    canvases.original.height = height;
    originalCtx.drawImage(videoElement, 0, 0, width, height);
    
    // Get image data
    const imageData = originalCtx.getImageData(0, 0, width, height);
    const grayData = toGrayscale(imageData.data);
    
    // Process each active operator
    processOperators(grayData, width, height);
    
    // Continue animation
    animationId = requestAnimationFrame(processVideoFrame);
}

// ==================== IMAGE UPLOAD ====================
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            processImage(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function processImage(img) {
    const width = img.width;
    const height = img.height;
    
    // Draw original image
    const originalCtx = canvases.original.getContext('2d');
    canvases.original.width = width;
    canvases.original.height = height;
    originalCtx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = originalCtx.getImageData(0, 0, width, height);
    const grayData = toGrayscale(imageData.data);
    
    // Process operators
    processOperators(grayData, width, height);
}

// ==================== OPERATOR PROCESSING ====================
function processOperators(grayData, width, height) {
    // Sobel
    if (activeOperators.sobel) {
        processOperator('sobel', SobelOperator, grayData, width, height);
    }
    
    // Roberts
    if (activeOperators.roberts) {
        processOperator('roberts', RobertsOperator, grayData, width, height);
    }
    
    // Prewitt
    if (activeOperators.prewitt) {
        processOperator('prewitt', PrewittOperator, grayData, width, height);
    }
    
    // Laplace
    if (activeOperators.laplace) {
        processOperator('laplace', LaplaceOperator, grayData, width, height);
    }
    
    // Canny
    if (activeOperators.canny) {
        processOperator('canny', CannyOperator, grayData, width, height);
    }
}

function processOperator(name, operator, grayData, width, height) {
    const canvas = canvases[name];
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    // Apply operator
    const processed = operator.apply(grayData, width, height);
    
    // Apply threshold
    const thresholded = applyThreshold(processed, thresholdValue);
    
    // Draw result
    const imageData = new ImageData(thresholded, width, height);
    ctx.putImageData(imageData, 0, 0);
}

// ==================== OPERATOR TOGGLE ====================
function toggleOperator(operatorName, button) {
    activeOperators[operatorName] = !activeOperators[operatorName];
    button.classList.toggle('active');
    
    // Show/hide canvas container
    const container = document.getElementById(operatorName + 'Container');
    if (container) {
        container.style.display = activeOperators[operatorName] ? 'block' : 'none';
    }
    
    // Reprocess if needed
    if (currentMode === 'upload' && canvases.original.width > 0) {
        const ctx = canvases.original.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvases.original.width, canvases.original.height);
        const grayData = toGrayscale(imageData.data);
        processOperators(grayData, canvases.original.width, canvases.original.height);
    }
}

// ==================== THRESHOLD UPDATE ====================
function updateThreshold(value) {
    thresholdValue = parseInt(value);
    document.getElementById('thresholdValue').textContent = value;
    
    // Reprocess current image/frame
    if (currentMode === 'upload' && canvases.original.width > 0) {
        const ctx = canvases.original.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvases.original.width, canvases.original.height);
        const grayData = toGrayscale(imageData.data);
        processOperators(grayData, canvases.original.width, canvases.original.height);
    }
}

// ==================== INITIALIZATION ====================
// Set initial mode
switchMode('webcam');

console.log('Edge Detection App loaded successfully!');
console.log('Available operators:', Object.keys(activeOperators));