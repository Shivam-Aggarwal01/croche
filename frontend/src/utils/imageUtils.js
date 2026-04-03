import API_BASE_URL from '../config/api';

export const getImageUrl = (url) => {
  const fallbackPlaceholder = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#f1f5f9"/>
      <rect x="40" y="40" width="720" height="720" rx="32" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="42" fill="#64748b" font-family="Arial">No Image</text>
    </svg>
  `)}`;

  const value =
    typeof url === 'string'
      ? url
      : url?.secure_url || url?.url || url?.path || url?.imageUrl || '';

  if (!value) return fallbackPlaceholder;

  const valueNormalized = String(value).trim().replace(/\\/g, '/');

  if (valueNormalized.startsWith('http') || valueNormalized.startsWith('data:')) return valueNormalized;
  
  // If the URL starts with /images/, it's a local frontend asset
  if (valueNormalized.startsWith('/images/')) {
    return valueNormalized;
  }

  // If you stored an absolute filesystem path like:
  // /opt/render/project/src/backend/uploads/<file>
  // convert it into an API-served URL:
  // https://<api-base>/uploads/<file>
  const uploadsIndex = valueNormalized.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    const filePart = valueNormalized.slice(uploadsIndex + '/uploads/'.length).replace(/^\/+/, '');
    if (filePart) return `${API_BASE_URL}/uploads/${filePart}`;
  }

  if (valueNormalized.startsWith('/uploads/')) {
    return `${API_BASE_URL}${valueNormalized}`;
  }
  
  return `${API_BASE_URL}${valueNormalized.startsWith('/') ? '' : '/'}${valueNormalized}`;
};

// Some products may be stored as `images: []`, but older data can also be `images: "..."`.
// This normalizes both shapes so we always return a URL string (or empty string).
export const getFirstImage = (imagesField) => {
  if (!imagesField) return '';
  if (Array.isArray(imagesField)) return imagesField[0] || '';
  if (typeof imagesField === 'string') return imagesField;
  if (typeof imagesField === 'object') {
    return imagesField.secure_url || imagesField.url || imagesField.path || imagesField.imageUrl || '';
  }
  return '';
};
