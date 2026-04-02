import API_BASE_URL from '../config/api';

export const getImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  // If the URL starts with /images/, it's likely a local frontend public/images/ asset
  if (url.startsWith('/images/')) {
    return url;
  }
  
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
