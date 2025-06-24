import routes from "../routes/routes.js";
import {
  getActiveRoute,
  getExactActiveRoute,
  parseActivePathname,
} from "../routes/url-parser.js";
import Navbar from "../components/navbar.js";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper.js";
import DetailPage from "../pages/detail/detail-page.js";

class App {
  #content;

  constructor({ content }) {
    this.#content = content;
  }

  async renderPage() {
    const exactPath = getExactActiveRoute();
    const activeRoute = getActiveRoute();
    const parsedPath = parseActivePathname();
    const isLoggedIn = !!localStorage.getItem("token");

    document.body.classList.remove("login-page", "register-page");
    if (exactPath === "/login") {
      document.body.classList.add("login-page");
    } else if (exactPath === "/register") {
      document.body.classList.add("register-page");
    }

    if (!isLoggedIn && exactPath !== "/login" && exactPath !== "/register") {
      window.location.hash = "/login";
      return;
    }

    if (activeRoute === "/detail/:id" && parsedPath.id) {
      const page = new DetailPage(parsedPath.id);
      const contentHTML = await page.render();
      this.#content.innerHTML = contentHTML;
      await page.afterRender();
      return;
    }

    const page = routes[activeRoute] || {
      render: async () =>
        `<p class="text-center text-red-500">Halaman tidak ditemukan</p>`,
      afterRender: async () => {},
    };

    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
      headerContainer.innerHTML = Navbar();
    }

    const renderContent = async () => {
      const contentHTML = await page.render();
      this.#content.innerHTML = contentHTML;
      if (page.afterRender) await page.afterRender();

      const skipLink = document.querySelector(".skip-to-content");
      const mainContent = document.getElementById("main-content");
      if (skipLink && mainContent) {
        skipLink.addEventListener("click", (e) => {
          e.preventDefault();
          mainContent.setAttribute("tabindex", "-1");
          mainContent.focus();
        });
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(renderContent);
    } else {
      await renderContent();
    }

    this.#setupDrawer();
    this.#setupLogout();
    this.#setupPushNotification();
  }

  #setupDrawer() {
    const drawer = document.getElementById("drawer");
    const drawerButton = document.getElementById("drawer-button");

    if (drawer && drawerButton) {
      drawerButton.addEventListener("click", () => {
        drawer.classList.toggle("-translate-x-full");
      });

      const drawerLinks = document.querySelectorAll(".drawer-link");
      drawerLinks.forEach((link) => {
        link.addEventListener("click", () => {
          drawer.classList.add("-translate-x-full");
        });
      });

      document.body.addEventListener("click", (e) => {
        const clickedOutside =
          !drawer.contains(e.target) && !drawerButton.contains(e.target);
        if (!drawer.classList.contains("-translate-x-full") && clickedOutside) {
          drawer.classList.add("-translate-x-full");
        }
      });

      drawer.classList.add("-translate-x-full");
    }
  }

  #setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    const logoutBtnDrawer = document.getElementById("logoutBtnDrawer");

    [logoutBtn, logoutBtnDrawer].forEach((btn) => {
      if (btn) {
        btn.addEventListener("click", () => {
          localStorage.removeItem("token");
          window.location.hash = "/login";
        });
      }
    });
  }

  async #setupPushNotification() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notification tidak didukung.");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker terdaftar:", registration);

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Izin notifikasi tidak diberikan");
        return;
      }

      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      console.log(
        `Status subscription: ${isSubscribed ? "SUDAH" : "BELUM"} terdaftar`
      );

      const updateButtonState = async () => {
        const btnIds = ["subscribeToggleBtn", "drawer-subscribeToggleBtn"];
        for (const id of btnIds) {
          const button = document.getElementById(id);
          if (!button) continue;

          button.innerHTML = isSubscribed
            ? '<i class="fas fa-bell-slash mr-1"></i> Unsubscribe'
            : '<i class="fas fa-bell mr-1"></i> Subscribe';

          button.className = isSubscribed
            ? "bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition flex items-center"
            : "bg-white text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition flex items-center";

          button.onclick = async () => {
            if (isSubscribed) {
              await unsubscribe();
            } else {
              await subscribe();
            }

            const headerContainer = document.getElementById("header-container");
            if (headerContainer) {
              const newStatus = await isCurrentPushSubscriptionAvailable();
              headerContainer.innerHTML = Navbar(newStatus);
              this.#setupDrawer();
              this.#setupLogout();
              this.#setupPushNotification();
            }
          };
        }
      };

      await updateButtonState();
    } catch (error) {
      console.error("Gagal setup push notification:", error);
    }
  }
}

export default App;
