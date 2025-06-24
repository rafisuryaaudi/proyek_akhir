import { loginUser } from '../../../data/api.js';

const LoginPresenter = {
  async login({ email, password }) {
    return await loginUser(email, password);
  }
};

export default LoginPresenter;
