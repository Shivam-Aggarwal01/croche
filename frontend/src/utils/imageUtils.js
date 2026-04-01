export const getImageUrl = (url) => {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
};
