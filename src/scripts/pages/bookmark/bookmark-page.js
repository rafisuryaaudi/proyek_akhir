import BookmarkPresenter from "./bookmark-presenter.js";
import Database from "../../data/database.js";

export default class BookmarkPage {
  #presenter;

  async render() {
    return `
      <section class="px-8 py-8 max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-blue-700 mb-6">Cerita yang Tersimpan</h2>
        <div class="reports-list__container">
          <div id="reports-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"></div>
          <div id="reports-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });
    await this.#presenter.initialGalleryAndMap();
  }

  populateBookmarkedReports(message, reports) {
    if (reports.length <= 0) {
      this.populateBookmarkedReportsListEmpty();
      return;
    }

    const html = reports.reduce((accumulator, report) => {
      return accumulator.concat(`
        <div class="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <img src="${
            report.photoUrl || "https://via.placeholder.com/150"
          }" alt="Story Photo" class="w-full h-48 object-cover rounded-lg mb-4">
          <h3 class="text-lg font-semibold">${report.name}</h3>
          <p class="text-gray-600 text-sm">${
            report.description.length > 100
              ? report.description.slice(0, 100) + "..."
              : report.description
          }</p>
          <p class="text-sm text-gray-500 mt-2">Lokasi: ${
            report.lat && report.lon ? "Tersedia" : "Tidak tersedia"
          }</p>
          <div class="mt-4 flex space-x-4">
            <button class="btn-detail text-green-600 hover:text-green-800" data-id="${
              report.id
            }">
              <i class="fas fa-eye"></i> Detail
            </button>
            <button class="btn-remove text-yellow-600 hover:text-yellow-800" data-id="${
              report.id
            }">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        </div>
      `);
    }, "");

    document.getElementById("reports-list").innerHTML = html;

    document.querySelectorAll(".btn-remove").forEach((button) => {
      button.addEventListener("click", async () => {
        const reportId = button.getAttribute("data-id");
        await this.#presenter.removeReport(reportId);
        await this.#presenter.initialGalleryAndMap();
      });
    });

    document.querySelectorAll(".btn-detail").forEach((button) => {
      button.addEventListener("click", () => {
        const storyId = button.getAttribute("data-id");
        window.location.hash = `#/detail/${storyId}`;
      });
    });
  }

  populateBookmarkedReportsListEmpty() {
    document.getElementById("reports-list").innerHTML =
      "Tidak ada cerita yang tersimpan.";
  }

  populateBookmarkedReportsError(message) {
    document.getElementById(
      "reports-list"
    ).innerHTML = `<p class="text-red-600">Error: ${message}</p>`;
  }

  showReportsListLoading() {
    document.getElementById("reports-list-loading-container").innerHTML =
      "Loading...";
  }

  hideReportsListLoading() {
    document.getElementById("reports-list-loading-container").innerHTML = "";
  }
}
