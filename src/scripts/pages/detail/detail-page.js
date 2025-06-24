import DetailPresenter from './detail-presenter.js';
import Database from '../../data/database.js';

export default class DetailPage {
  #presenter;
  #storyId;

  constructor(storyId) {
    this.#storyId = storyId;
  }

  async render() {
    return `
      <section class="px-8 py-8 max-w-4xl mx-auto">
        <div id="detail-container" class="bg-white p-6 rounded-lg shadow-md">
          <p>Loading detail cerita...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter({
      view: this,
      model: Database,
    });

    await this.#presenter.loadStoryDetail(this.#storyId);
  }

  renderStoryDetail(story) {
    if (!story) {
      document.getElementById('detail-container').innerHTML = 
        '<p class="text-red-600">Cerita tidak ditemukan.</p>';
      return;
    }

    document.getElementById('detail-container').innerHTML = `
      <h2 class="text-2xl font-bold mb-4">${story.name}</h2>
      <img src="${story.photoUrl || 'https://via.placeholder.com/600x400'}" alt="Foto Cerita" class="w-full rounded-lg mb-4 object-cover max-h-96" />
      <p class="mb-4">${story.description}</p>
      <p><strong>Lokasi:</strong> ${
        story.lat && story.lon
          ? `Latitude: ${story.lat}, Longitude: ${story.lon}`
          : 'Tidak tersedia'
      }</p>
    `;
  }

  renderError(message) {
    document.getElementById('detail-container').innerHTML = 
      `<p class="text-red-600">Error: ${message}</p>`;
  }
}
