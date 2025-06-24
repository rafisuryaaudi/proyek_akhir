import { getAllStories } from '../../data/api.js';

const HomePresenter = {
  async fetchStories(token) {
    const result = await getAllStories(token); 
    if (result.error) {
      console.error('Error fetching stories:', result.message);
      return { error: true, message: result.message };
    }

    return result; 
  },

  async getLocationName(lat, lon) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await response.json();
      return data.display_name || 'Lokasi tidak ditemukan';
    } catch (error) {
      console.error('Error fetching location name:', error);
      return 'Lokasi tidak ditemukan';
    }
  },

  async checkImage(imageUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(imageUrl);
      img.onerror = () => resolve('https://via.placeholder.com/150');
      img.src = imageUrl;
    });
  }
};

export default HomePresenter;

