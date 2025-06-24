import LoginPresenter from './login-presenter';

class LoginPage {
  async render() {
    return `
      <section class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
          <h2 class="text-3xl font-bold text-center text-blue-700 mb-6">Masukan Akun</h2>
          <form id="loginForm" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium">Email</label>
              <input type="email" id="email" name="email" class="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium">Password</label>
              <input type="password" id="password" name="password" class="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Login</button>
          </form>
          <p class="text-center text-sm text-gray-600 mt-4">Belum punya akun? 
            <a href="#/register" class="text-blue-700 font-semibold hover:underline">Daftar di sini</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.email.value;
      const password = form.password.value;

      const result = await LoginPresenter.login({ email, password });

      if (!result.error) {
        localStorage.setItem('token', result.loginResult.token);
        localStorage.setItem('name', result.loginResult.name);
        alert('Login berhasil!');
        window.location.hash = '/';
      } else {
        alert(`Login gagal: ${result.message}`);
      }
    });
  }
}

export default LoginPage;
