const BASE_URL = 'https://story-api.dicoding.dev/v1';

const ENDPOINTS = {
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  STORIES: `${BASE_URL}/stories`,
  GUEST_STORIES: `${BASE_URL}/stories/guest`,
  LOGIN: `${BASE_URL}/login`,
  REGISTER: `${BASE_URL}/register`,
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getAllStories = async (token, withLocation = false, page = 1, size = 10) => {
  try {
    const url = `${ENDPOINTS.STORIES}?location=${withLocation ? 1 : 0}&page=${page}&size=${size}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getStoryById = async (id, token) => {
  try {
    const response = await fetch(`${ENDPOINTS.STORIES}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const createStory = async (formData, token) => {
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const createStoryGuest = async (formData) => {
  try {
    const response = await fetch(ENDPOINTS.GUEST_STORIES, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = localStorage.getItem('token');
  const data = JSON.stringify({ endpoint, keys: { p256dh, auth } });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });

  const json = await fetchResponse.json();
  return { ...json, ok: fetchResponse.ok };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = localStorage.getItem('token');
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });

  const json = await fetchResponse.json();
  return { ...json, ok: fetchResponse.ok };
}
