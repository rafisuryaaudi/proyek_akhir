import RegisterPresenter from './register-presenter';

class RegisterPage {
  async render() {
    return `
      <section class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <h2 class="text-3xl font-bold text-center text-blue-700 mb-6">Buat Akun Baru</h2>
          <form id="registerForm" class="space-y-5" novalidate>
            <div>
              <label for="name" class="block text-sm font-medium">Nama</label>
              <input type="text" id="name" name="name" class="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium">Email</label>
              <input type="email" id="email" name="email" class="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium">Password</label>
              <input type="password" id="password" name="password" class="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" minlength="8" required />
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Daftar</button>
          </form>
          <p class="text-center text-sm text-gray-600 mt-4">Sudah punya akun? 
            <a href="#/login" class="text-blue-700 font-semibold hover:underline">Login di sini</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();

      if (!name || !email || !password) {
        alert('Semua kolom wajib diisi!');
        return;
      }

      const result = await RegisterPresenter.register({ name, email, password });

      if (!result.error) {
        alert('Registrasi berhasil! Silakan login.');
        window.location.hash = '/login';
      } else {
        alert(`Registrasi gagal: ${result.message}`);
      }
    });
  }
}

export default RegisterPage;
