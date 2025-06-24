export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialGalleryAndMap() {
    this.#view.showReportsListLoading();
    try {
      const listOfStories = await this.#model.getAllStories();
      if (listOfStories.length > 0) {
        this.#view.populateBookmarkedReports('Daftar cerita yang tersimpan', listOfStories);
      } else {
        this.#view.populateBookmarkedReportsListEmpty();
      }
    } catch (error) {
      console.error('Error mengambil cerita:', error);
      this.#view.populateBookmarkedReportsError(error.message);
    } finally {
      this.#view.hideReportsListLoading();
    }
  }

  async removeReport(storyId) {
    try {
      await this.#model.deleteStoryById(storyId);
    } catch (error) {
      console.error('removeReport: error:', error);
      this.#view.populateBookmarkedReportsError(error.message);
    }
  }
}
