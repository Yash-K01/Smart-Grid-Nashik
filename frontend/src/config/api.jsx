// API Configuration - Change this based on environment
const API_CONFIG = {
  development: {
    BASE_URL: 'http://localhost:5000/api'  // Local development
  },
  production: {
    BASE_URL: 'https://smart-grid-nashik.onrender.com/api'  // REPLACE with your Render URL
  }
}

const env = process.env.NODE_ENV || 'development'
export const API_URL = API_CONFIG[env].BASE_URL