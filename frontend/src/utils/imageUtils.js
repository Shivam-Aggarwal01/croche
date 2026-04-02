import API_BASE_URL from '../config/api';

export const getImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  // If the URL starts with /images/, it's a local frontend asset
  if (url.startsWith('/images/')) {
    return url;
  }
  
  // On Render, the local /uploads/ folder is wiped on restart.
  // We should fallback to placeholder for any old /uploads/ paths in production.
  if (url.startsWith('/uploads/') && !API_BASE_URL.includes('localhost')) {
    return '/placeholder.png';
  }
  
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
