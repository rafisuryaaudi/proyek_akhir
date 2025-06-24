import { registerUser } from '../../../data/api.js';

const RegisterPresenter = {
  async register({ name, email, password }) {
    return await registerUser(name, email, password);
  }
};

export default RegisterPresenter;
