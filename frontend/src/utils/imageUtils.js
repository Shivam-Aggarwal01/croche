import API_BASE_URL from '../config/api';

export const getImageUrl = (url) => {
  const value =
    typeof url === 'string'
      ? url
      : url?.secure_url || url?.url || url?.path || url?.imageUrl || '';

  if (!value) return '/placeholder.png';

  if (value.startsWith('http') || value.startsWith('data:')) return value;
  
  // If the URL starts with /images/, it's a local frontend asset
  if (value.startsWith('/images/')) {
    return value;
  }
  
  return `${API_BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
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
