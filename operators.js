// ==================== OPERATOR SOBEL ====================
// File: operators.js - Bagian 1
// Fungsi: Deteksi tepi menggunakan kernel Sobel 3x3

const SobelOperator = {
    name: 'Sobel',
    apply: function(data, width, height) {
        const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        const result = new Uint8ClampedArray(data.length);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sumX = 0, sumY = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const k = (ky + 1) * 3 + (kx + 1);
                        sumX += data[idx] * gx[k];
                        sumY += data[idx] * gy[k];
                    }
                }
                
                const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
                const idx = (y * width + x) * 4;
                result[idx] = result[idx + 1] = result[idx + 2] = magnitude;
                result[idx + 3] = 255;
            }
        }
        
        return result;
    }
};

// ==================== OPERATOR ROBERTS ====================
// File: operators.js - Bagian 2
// Fungsi: Deteksi tepi menggunakan kernel Roberts 2x2

const RobertsOperator = {
    name: 'Roberts',
    apply: function(data, width, height) {
        const result = new Uint8ClampedArray(data.length);
        
        for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width - 1; x++) {
                const idx1 = (y * width + x) * 4;
                const idx2 = (y * width + (x + 1)) * 4;
                const idx3 = ((y + 1) * width + x) * 4;
                const idx4 = ((y + 1) * width + (x + 1)) * 4;
                
                const gx = data[idx1] - data[idx4];
                const gy = data[idx2] - data[idx3];
                
                const magnitude = Math.sqrt(gx * gx + gy * gy);
                const idx = (y * width + x) * 4;
                result[idx] = result[idx + 1] = result[idx + 2] = magnitude;
                result[idx + 3] = 255;
            }
        }
        
        return result;
    }
};

// ==================== OPERATOR PREWITT ====================
// File: operators.js - Bagian 3
// Fungsi: Deteksi tepi menggunakan kernel Prewitt 3x3

const PrewittOperator = {
    name: 'Prewitt',
    apply: function(data, width, height) {
        const gx = [-1, 0, 1, -1, 0, 1, -1, 0, 1];
        const gy = [-1, -1, -1, 0, 0, 0, 1, 1, 1];
        const result = new Uint8ClampedArray(data.length);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sumX = 0, sumY = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const k = (ky + 1) * 3 + (kx + 1);
                        sumX += data[idx] * gx[k];
                        sumY += data[idx] * gy[k];
                    }
                }
                
                const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
                const idx = (y * width + x) * 4;
                result[idx] = result[idx + 1] = result[idx + 2] = magnitude;
                result[idx + 3] = 255;
            }
        }
        
        return result;
    }
};

// ==================== OPERATOR LAPLACE ====================
// File: operators.js - Bagian 4
// Fungsi: Deteksi tepi menggunakan kernel Laplace

const LaplaceOperator = {
    name: 'Laplace',
    apply: function(data, width, height) {
        const kernel = [0, -1, 0, -1, 4, -1, 0, -1, 0];
        const result = new Uint8ClampedArray(data.length);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sum = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const k = (ky + 1) * 3 + (kx + 1);
                        sum += data[idx] * kernel[k];
                    }
                }
                
                const value = Math.abs(sum);
                const idx = (y * width + x) * 4;
                result[idx] = result[idx + 1] = result[idx + 2] = value;
                result[idx + 3] = 255;
            }
        }
        
        return result;
    }
};

// ==================== OPERATOR CANNY ====================
// File: operators.js - Bagian 5
// Fungsi: Deteksi tepi multi-stage (Gaussian blur + Sobel + NMS)

const CannyOperator = {
    name: 'Canny',
    apply: function(data, width, height) {
        // Step 1: Gaussian blur
        const blurred = this.gaussianBlur(data, width, height);
        
        // Step 2: Sobel edge detection
        const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        const edges = new Uint8ClampedArray(data.length);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sumX = 0, sumY = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const k = (ky + 1) * 3 + (kx + 1);
                        sumX += blurred[idx] * gx[k];
                        sumY += blurred[idx] * gy[k];
                    }
                }
                
                const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
                const idx = (y * width + x) * 4;
                edges[idx] = edges[idx + 1] = edges[idx + 2] = magnitude;
                edges[idx + 3] = 255;
            }
        }
        
        // Step 3: Non-maximum suppression
        return this.nonMaxSuppression(edges, width, height);
    },
    
    gaussianBlur: function(data, width, height) {
        const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
        const result = new Uint8ClampedArray(data.length);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sum = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const k = (ky + 1) * 3 + (kx + 1);
                        sum += data[idx] * kernel[k];
                    }
                }
                
                const value = sum / 16;
                const idx = (y * width + x) * 4;
                result[idx] = result[idx + 1] = result[idx + 2] = value;
                result[idx + 3] = 255;
            }
        }
        
        return result;
    },
    
    nonMaxSuppression: function(data, width, height) {
        const result = new Uint8ClampedArray(data.length);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const current = data[idx];
                
                const n = data[((y - 1) * width + x) * 4];
                const s = data[((y + 1) * width + x) * 4];
                const e = data[(y * width + (x + 1)) * 4];
                const w = data[(y * width + (x - 1)) * 4];
                
                if (current >= n && current >= s && current >= e && current >= w) {
                    result[idx] = result[idx + 1] = result[idx + 2] = current;
                } else {
                    result[idx] = result[idx + 1] = result[idx + 2] = 0;
                }
                result[idx + 3] = 255;
            }
        }
        
        return result;
    }
};

// ==================== HELPER FUNCTIONS ====================
// Fungsi bantuan untuk konversi grayscale dan threshold

function toGrayscale(data) {
    const gray = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        gray[i] = gray[i + 1] = gray[i + 2] = avg;
        gray[i + 3] = data[i + 3];
    }
    return gray;
}

function applyThreshold(data, thresh) {
    const result = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
        const value = data[i] > thresh ? 255 : 0;
        result[i] = result[i + 1] = result[i + 2] = value;
        result[i + 3] = 255;
    }
    return result;
}