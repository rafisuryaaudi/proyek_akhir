import HomePage from '../pages/home/home-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';
import FormPage from '../pages/form/form-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';

const routes = {
  '/': new HomePage(),
  '/bookmark': new BookmarkPage(),
  '/form': new FormPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
};

export default routes;
