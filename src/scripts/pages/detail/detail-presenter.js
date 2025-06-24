export default class DetailPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

async loadStoryDetail(storyId) {
  try {
    if (!storyId) throw new Error('ID cerita tidak valid');
    
    const story = await this.#model.getStoryById(storyId);
    this.#view.renderStoryDetail(story);
  } catch (error) {
    console.error('loadStoryDetail error:', error);
    this.#view.renderError(error.message);
  }
}
}
