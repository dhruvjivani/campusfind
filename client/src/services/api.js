// API service — communicates with the Express backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async request(method, endpoint, data = null) {
    try {
      const options = { method, headers: this.getHeaders() };
      if (data) options.body = JSON.stringify(data);

      const response = await fetch(`${this.baseURL}${endpoint}`, options);

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(result.message || `API Error: ${response.status}`);
      }

      return result;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Network error: Unable to reach server');
      }
      throw error;
    }
  }

  // Auth
  async register(userData) { return this.request('POST', '/auth/register', userData); }
  async login(credentials) { return this.request('POST', '/auth/login', credentials); }
  async logout() { this.clearToken(); }
  async getMyProfile() { return this.request('GET', '/auth/me'); }

  // Items
  async getItems(filters = {}) {
    let query = '';
    if (filters.status)   query += `?status=${filters.status}`;
    if (filters.category) query += `${query ? '&' : '?'}category=${filters.category}`;
    if (filters.campus)   query += `${query ? '&' : '?'}campus=${filters.campus}`;
    if (filters.search)   query += `${query ? '&' : '?'}search=${encodeURIComponent(filters.search)}`;
    return this.request('GET', `/items${query}`);
  }

  async getItemById(id)         { return this.request('GET', `/items/${id}`); }
  async createItem(itemData) {
    const endpoint = itemData.status === 'found' ? '/items/found' : '/items/lost';
    return this.request('POST', endpoint, itemData);
  }
  async updateItem(id, data)    { return this.request('PUT', `/items/${id}`, data); }
  async deleteItem(id)          { return this.request('DELETE', `/items/${id}`); }
  async updateItemStatus(id, data) { return this.request('PUT', `/items/${id}/status`, data); }
  async getItemClaims(id)       { return this.request('GET', `/items/${id}/claims`); }

  // Claims
  async createClaim(data)       { return this.request('POST', '/claims', data); }
  async getMyClaims()           { return this.request('GET', '/claims/user/my-claims'); }
  async getClaims(filters = {}) {
    let query = filters.status ? `?status=${filters.status}` : '';
    return this.request('GET', `/claims${query}`);
  }
  async getClaimById(id)        { return this.request('GET', `/claims/${id}`); }
  async updateClaim(id, data)   { return this.request('PUT', `/claims/${id}`, data); }
  async verifyClaim(id, data)   { return this.request('PUT', `/claims/${id}/verify`, data); }
  async deleteClaim(id)         { return this.request('DELETE', `/claims/${id}`); }
}

const apiService = new APIService();
export default apiService;
