import axios from 'axios';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = isLocal ? 'http://localhost:5000/api/v1' : 'https://backend-ashy-seven-83.vercel.app/api/v1';

const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

export const milestonesApi = {
  /**
   * Get all milestones for a project
   * @param {string} projectId
   * @param {{ phase?: string, status?: string }} filters
   */
  getAll: (projectId, filters = {}) => {
    const params = { projectId, ...filters };
    return api.get('/milestones', { params });
  },

  /**
   * Get AI-synthesized summary + predictive analytics for a project
   * @param {string} projectId
   * @param {number} budget - Project budget in INR
   */
  getSummary: (projectId, budget) => {
    const params = budget ? { budget } : {};
    return api.get(`/milestones/summary/${projectId}`, { params });
  },

  /**
   * Create a new milestone (Site Engineer)
   * @param {Object} data - Milestone payload
   */
  create: (data) => api.post('/milestones', data),

  /**
   * Update an existing milestone — triggers AI re-analysis and notifications
   * @param {string} id - Milestone _id
   * @param {Object} updates - Fields to update
   */
  update: (id, updates) => api.patch(`/milestones/${id}`, updates),
};
