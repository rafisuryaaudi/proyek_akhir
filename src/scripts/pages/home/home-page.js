import HomePresenter from './home-presenter';
import { getStoryById } from '../../data/api.js';
import Database from '../../data/database';

class HomePage {
  constructor() {
    this.page = 1;
    this.pageSize = 3;
  }

  async render() {
    return `
      <section class="px-8 py-8 max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-blue-700 mb-6">Daftar Cerita</h2>
        <div class="mb-6">
          <input 
            id="searchInput" 
            type="text" 
            placeholder="Cari cerita..." 
            class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div id="storiesContainer" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <!-- Stories will be displayed here -->
        </div>
        <div id="pagination" class="flex justify-between mt-6 mb-10">
          <button id="prevButton" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300" disabled>
            Previous
          </button>
          <button id="nextButton" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300">
            Next
          </button>
        </div>
        <div>
          <h3 class="text-2xl font-semibold text-blue-700 mb-4">Peta Lokasi Cerita</h3>
          <div id="map" class="w-full h-[400px] rounded-lg shadow-md"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const searchInput = document.getElementById('searchInput');
    const container = document.getElementById('storiesContainer');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Anda harus login untuk melihat cerita");
      window.location.hash = '/login';
      return;
    }

    const result = await HomePresenter.fetchStories(token);
    if (result.error) {
      alert('Gagal mengambil cerita: ' + result.message);
      return;
    }

    const displayStories = async (stories) => {
      container.innerHTML = '';
      for (const story of stories) {
        const storyElement = document.createElement('div');
        storyElement.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-md', 'flex', 'flex-col', 'items-center', 'justify-center');

        const photoUrl = await HomePresenter.checkImage(story.photoUrl);
        const location = story.lat && story.lon ? await HomePresenter.getLocationName(story.lat, story.lon) : 'Lokasi tidak tersedia';

        storyElement.innerHTML = `
          <img src="${photoUrl}" alt="Story Photo" class="w-full h-48 object-cover rounded-lg mb-4">
          <h3 class="text-lg font-semibold">${story.name}</h3>
          <p class="text-gray-600 text-sm">${story.description.length > 100 ? story.description.slice(0, 100) + '...' : story.description}</p>
          <p class="text-sm text-gray-500 mt-2">Lokasi: ${location}</p>
          <div class="mt-4 flex space-x-4">
            <button class="saveButton text-yellow-600 hover:text-yellow-800" data-id="${story.id}">
              <i class="fas fa-save"></i> Simpan
            </button>
          </div>
        `;

        container.appendChild(storyElement);
      }

      const saveButtons = document.querySelectorAll('.saveButton');
      saveButtons.forEach(button => {
        button.addEventListener('click', async () => {
          const storyId = button.getAttribute('data-id');
          await saveStory(storyId);
        });
      });
    };

    const paginate = async (stories) => {
      const start = (this.page - 1) * this.pageSize;
      const end = this.page * this.pageSize;
      const currentPageStories = stories.slice(start, end);
      await displayStories(currentPageStories);
      prevButton.disabled = this.page === 1;
      nextButton.disabled = this.page * this.pageSize >= stories.length;
    };

    await paginate(result.listStory);

    nextButton.addEventListener('click', async () => {
      if (this.page * this.pageSize < result.listStory.length) {
        this.page++;
        await paginate(result.listStory);
      }
    });

    prevButton.addEventListener('click', async () => {
      if (this.page > 1) {
        this.page--;
        await paginate(result.listStory);
      }
    });

    searchInput.addEventListener('input', async () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredStories = result.listStory.filter(story =>
        story.name.toLowerCase().includes(searchTerm) ||
        story.description.toLowerCase().includes(searchTerm)
      );
      this.page = 1;
      await paginate(filteredStories);
    });

    const map = L.map('map').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    result.listStory.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`<strong>${story.name}</strong><br>${story.description.slice(0, 100)}...`);
      }
    });
  }
}

async function saveStory(storyId) {
  console.log('Mencari cerita dengan ID:', storyId);

  let story = await Database.getStoryById(storyId);

  if (!story) {
    console.log('Cerita tidak ditemukan di IndexedDB, mengambil dari API...');
    
    const token = localStorage.getItem('token');
    const result = await getStoryById(storyId, token);
    
    if (result.error) {
      console.error('Gagal mengambil cerita dari API:', result.message);
      alert('Gagal mengambil cerita dari API.');
      return;
    }
    
    if (!result || !result.story) {
      console.error('Cerita tidak ditemukan di respons API:', result);
      alert('Cerita tidak ditemukan.');
      return;
    }
    
    story = result.story;
    await Database.putReport(story);
    console.log('Cerita telah disimpan:', story);
  } else {
    console.log('Cerita sudah ada di IndexedDB:', story);
  }

  alert('Cerita telah disimpan');
}

window.saveStory = saveStory;

export default HomePage;
