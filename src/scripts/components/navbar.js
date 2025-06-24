const renderSubscribeButton = (isSubscribed, idPrefix = "") => {
  const buttonId = `${idPrefix}subscribeToggleBtn`;
  const label = isSubscribed ? "Unsubscribe" : "Subscribe";
  const icon = isSubscribed ? "fa-bell-slash" : "fa-bell";

  return `
    <button id="${buttonId}" class="hover:bg-blue-700 px-3 py-2 rounded transition flex items-center text-white text-sm">
      <i class="fas ${icon} mr-1"></i> ${label}
    </button>
  `;
};

const Navbar = (isSubscribed = false) => {
  const isLoggedIn = !!localStorage.getItem("token");

  return `
    <header class="bg-blue-600 text-white shadow fixed w-full top-0 z-50">
      <div class="mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#/" class="text-xl font-bold flex items-center gap-2">
          <i class="fas fa-book-open"></i> Cerita Rafi
        </a>
        <button id="drawer-button" class="md:hidden text-2xl"><i class="fas fa-bars"></i></button>
        <nav id="nav-menu" class="hidden md:flex gap-4 text-sm items-center">
          ${renderSubscribeButton(isSubscribed)}
          <a href="#/" class="hover:bg-blue-700 px-3 py-2 rounded transition flex items-center">
            <i class="fas fa-home mr-1"></i> Beranda
          </a>
          <a href="#/form" class="hover:bg-blue-700 px-3 py-2 rounded transition flex items-center">
            <i class="fas fa-plus mr-1"></i> Tambah Cerita
          </a>
          <a href="#/bookmark" class="hover:bg-blue-700 px-3 py-2 rounded transition flex items-center">
            <i class="fas fa-bookmark mr-1"></i> Tersimpan
          </a>
          ${
            isLoggedIn
              ? `<button id="logoutBtn" class="hover:bg-red-700 px-3 py-2 rounded transition flex items-center text-white">
                  <i class="fas fa-sign-out-alt mr-1"></i> Logout
                </button>`
              : ""
          }
        </nav>
      </div>
    </header>
    <div class="h-12"></div>

    <div id="drawer" class="fixed left-0 top-0 w-64 h-full bg-white shadow-md transform -translate-x-full transition-transform duration-300 z-50">
      <div class="flex flex-col p-4 space-y-4 text-left">
        <a href="#/" class="drawer-link text-base text-gray-800 hover:text-blue-600 flex items-center">
          <i class="fas fa-home mr-2"></i> Beranda
        </a>
        <a href="#/form" class="drawer-link text-base text-gray-800 hover:text-blue-600 flex items-center">
          <i class="fas fa-plus mr-2"></i> Tambah Cerita
        </a>
        <a href="#/about" class="drawer-link text-base text-gray-800 hover:text-blue-600 flex items-center">
          <i class="fas fa-bookmark mr-2"></i> Tersimpan
        </a>
        ${renderSubscribeButton(isSubscribed, "drawer-")}
        ${
          isLoggedIn
            ? `<button id="logoutBtnDrawer" class="text-base text-red-600 hover:text-red-800 rounded w-fit flex items-center">
                <i class="fas fa-sign-out-alt mr-2"></i> Logout
              </button>`
            : ""
        }
      </div>
    </div>
  `;
};

export default Navbar;
