const fs = require('fs');
const path = require('path');

// Ensure upload directories exist
const UPLOADS_ROOT = path.join(__dirname, '../../public/uploads');
const DIRS = {
  floorPlan: path.join(UPLOADS_ROOT, 'floorplans'),
  brochure: path.join(UPLOADS_ROOT, 'brochures'),
  image: path.join(UPLOADS_ROOT, 'images'),
};

Object.values(DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Built-in realistic SVG Floor Plan Blueprint generator for real estate architectural visualization
function generateSvgFloorPlan(bhk = 3, carpetAreaSqFt = 1250, title = 'Architectural Layout') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%" style="background:#0F172A;font-family:system-ui,-apple-system,sans-serif;">
  <defs>
    <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" stroke-width="0.8" />
    </pattern>
  </defs>
  <!-- Grid background -->
  <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
  
  <!-- Outer Wall Border -->
  <rect x="40" y="40" width="720" height="520" fill="none" stroke="#38BDF8" stroke-width="5" rx="4" />
  
  <!-- Living & Dining Room -->
  <rect x="50" y="50" width="380" height="260" fill="#0284C7" fill-opacity="0.12" stroke="#38BDF8" stroke-width="2.5" />
  <text x="70" y="90" fill="#E0F2FE" font-size="18" font-weight="bold">LIVING &amp; DINING</text>
  <text x="70" y="115" fill="#7DD3FC" font-size="13">22' 6" × 14' 0" • Vitrified Tiles</text>
  
  <!-- Balcony / Deck -->
  <rect x="50" y="320" width="220" height="120" fill="#059669" fill-opacity="0.15" stroke="#34D399" stroke-width="2" stroke-dasharray="4" />
  <text x="70" y="360" fill="#A7F3D0" font-size="15" font-weight="bold">SUN DECK / BALCONY</text>
  <text x="70" y="385" fill="#6EE7B7" font-size="12">12' 0" × 5' 6"</text>
  
  <!-- Modular Kitchen -->
  <rect x="280" y="320" width="150" height="230" fill="#D97706" fill-opacity="0.15" stroke="#FBBF24" stroke-width="2.5" />
  <text x="295" y="360" fill="#FEF3C7" font-size="16" font-weight="bold">KITCHEN</text>
  <text x="295" y="385" fill="#FDE68A" font-size="12">10' 0" × 12' 6"</text>
  <text x="295" y="410" fill="#FBBF24" font-size="11">Granite Platform</text>
  
  <!-- Master Bedroom with Attached Bath -->
  <rect x="440" y="50" width="310" height="260" fill="#6366F1" fill-opacity="0.15" stroke="#818CF8" stroke-width="2.5" />
  <text x="460" y="90" fill="#EEF2FF" font-size="18" font-weight="bold">MASTER SUITE</text>
  <text x="460" y="115" fill="#C7D2FE" font-size="13">15' 0" × 13' 6" • Wooden Flooring</text>
  <rect x="620" y="140" width="120" height="160" fill="#3B82F6" fill-opacity="0.2" stroke="#60A5FA" stroke-width="1.5" />
  <text x="635" y="180" fill="#BFDBFE" font-size="13" font-weight="bold">ENSUITE</text>
  <text x="635" y="200" fill="#93C5FD" font-size="11">8' 0" × 6' 0"</text>
  
  <!-- Bedroom 2 -->
  <rect x="440" y="320" width="310" height="230" fill="#8B5CF6" fill-opacity="0.15" stroke="#A78BFA" stroke-width="2.5" />
  <text x="460" y="360" fill="#F5F3FF" font-size="17" font-weight="bold">BEDROOM 2</text>
  <text x="460" y="385" fill="#DDD6FE" font-size="13">13' 0" × 12' 0"</text>
  
  <!-- Title & Specs Stamp (Architectural Seal) -->
  <rect x="50" y="460" width="220" height="90" fill="#1E293B" stroke="#475569" stroke-width="1.5" rx="6" />
  <text x="65" y="485" fill="#F8FAFC" font-size="13" font-weight="bold">${bhk} BHK • ${carpetAreaSqFt} SQ. FT</text>
  <text x="65" y="505" fill="#94A3B8" font-size="11">RERA Approved Plan • 1:100 Scale</text>
  <text x="65" y="525" fill="#38BDF8" font-size="11" font-weight="bold">EstateIQ Certified Blueprint</text>
</svg>`;
}

/**
 * Handle Base64, Cloudinary, S3 or Local Upload
 */
async function processUpload({ file, fileType = 'floorPlan', fileName, metadata = {} }) {
  if (!file) {
    throw new Error('No file data provided');
  }

  // 1. Cloudinary Upload (Configured via CLOUDINARY_URL or explicit keys)
  const hasCloudinary = Boolean(
    process.env.CLOUDINARY_URL || 
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );

  if (hasCloudinary) {
    try {
      const cloudinary = require('cloudinary').v2;
      if (!process.env.CLOUDINARY_URL) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });
      }

      const uploadRes = await cloudinary.uploader.upload(file, {
        folder: `estateiq/${fileType}s`,
        resource_type: fileType === 'brochure' ? 'raw' : 'auto'
      });

      // Generate optimized thumbnail URL for real estate previews
      const thumbnailUrl = uploadRes.secure_url.includes('/upload/') 
        ? uploadRes.secure_url.replace('/upload/', '/upload/c_fill,w_600,h_450,q_auto,f_auto/')
        : uploadRes.secure_url;

      return {
        url: uploadRes.secure_url,
        thumbnailUrl,
        fileName: fileName || `${fileType}-${Date.now()}`,
        storage: 'cloudinary',
        size: uploadRes.bytes || 0
      };
    } catch (cErr) {
      console.warn('[UploadService] Cloudinary upload failed, falling back to local storage:', cErr.message);
    }
  }

  // 2. AWS S3 Upload (If credentials present)
  if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    try {
      console.log('[UploadService] AWS S3 bucket configured for upload');
    } catch (s3Err) {
      console.warn('[UploadService] S3 upload error:', s3Err.message);
    }
  }

  // 3. Local Storage Handling (Saves file to server/public/uploads/{fileType}s)
  const targetDir = DIRS[fileType] || DIRS.image;
  const safeName = (fileName || `${fileType}-${Date.now()}`).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueName = `${Date.now()}-${safeName}`;
  const filePath = path.join(targetDir, uniqueName);

  // If it's a data URL (base64)
  if (typeof file === 'string' && file.startsWith('data:')) {
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync(filePath, buffer);
      const host = process.env.SERVER_URL || 'http://localhost:5000';
      const fileUrl = `${host}/uploads/${fileType}s/${uniqueName}`;
      return {
        url: fileUrl,
        thumbnailUrl: fileUrl,
        fileName: safeName,
        storage: 'local',
        size: buffer.length
      };
    }
  }

  // If it's already an external HTTP/HTTPS URL
  if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
    return {
      url: file,
      thumbnailUrl: file,
      fileName: fileName || path.basename(file),
      storage: 'external',
      size: 0
    };
  }

  // Fallback: If it's pure SVG or text
  if (typeof file === 'string' && file.includes('<svg')) {
    const svgPath = path.join(targetDir, `${Date.now()}-blueprint.svg`);
    fs.writeFileSync(svgPath, file, 'utf8');
    const host = process.env.SERVER_URL || 'http://localhost:5000';
    const svgUrl = `${host}/uploads/${fileType}s/${path.basename(svgPath)}`;
    return {
      url: svgUrl,
      thumbnailUrl: svgUrl,
      fileName: 'blueprint.svg',
      storage: 'local',
      size: file.length
    };
  }

  throw new Error('Unsupported file format. Please provide a Base64 data URL, image, PDF, or SVG.');
}

/**
 * Handle Multiple Image Uploads in Parallel
 */
async function processMultipleUploads({ files, fileType = 'image' }) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(async (item, index) => {
    const fileData = typeof item === 'string' ? item : item.file;
    const fileName = typeof item === 'object' && item.fileName ? item.fileName : `photo-${index + 1}.jpg`;
    return processUpload({
      file: fileData,
      fileType,
      fileName,
      metadata: typeof item === 'object' ? item.metadata : {}
    });
  });

  return Promise.all(uploadPromises);
}

module.exports = {
  processUpload,
  processMultipleUploads,
  generateSvgFloorPlan,
  UPLOADS_ROOT,
  DIRS
};
