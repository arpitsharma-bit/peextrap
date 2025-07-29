// Utility function to update favicon with user's profile picture
export const updateFavicon = (imageUrl: string) => {
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
  existingLinks.forEach(link => link.remove());

  // Create new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = imageUrl;
  
  // Add to head
  document.head.appendChild(link);
};

// Function to reset favicon to default
export const resetFavicon = () => {
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
  existingLinks.forEach(link => link.remove());

  // Add default favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/x-icon';
  link.href = '/favicon.ico'; // Default favicon path
  
  document.head.appendChild(link);
};

// Function to create favicon from initials
export const createInitialsFavicon = (initials: string, backgroundColor: string = '#3B82F6') => {
  // Create canvas for favicon
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, 32, 32);

  // Draw initials
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials.toUpperCase(), 16, 16);

  // Convert to data URL
  const dataUrl = canvas.toDataURL('image/png');
  
  // Update favicon
  updateFavicon(dataUrl);
}; 