import { createStory } from '../../data/api';

const FormPresenter = {
  async submitStory(formData, token) {
    return await createStory(formData, token);
  }
};

export default FormPresenter;
