// Every call from the React app to the Express API goes through this file (Axios).
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// If the user is logged in, send their login token with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Turn an Axios error into a message we can show the user
export function getErrorMessage(err) {
  if (err.response && err.response.data && err.response.data.error) {
    return err.response.data.error; // message sent by our server
  }
  return 'Could not reach the server. Is it running?';
}

export default api;
