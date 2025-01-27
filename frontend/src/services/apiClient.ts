import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://backend:8080',  // Add this to an env file, and tell everyone to add it to their env file. For production, just plug in the real URL of the backend to Heroku or some shit
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;