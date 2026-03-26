// API Service for CampusFind

const API_BASE_URL = window.location.origin + '/api';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(method, endpoint, data = null) {
    try {
      const options = {
        method,
        headers: this.getHeaders(),
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, options);
      
      let result;
      try {
        result = await response.json();
      } catch (e) {
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

  // Authentication endpoints
  async register(userData) {
    return this.request('POST', '/auth/register', userData);
  }

  async login(credentials) {
    return this.request('POST', '/auth/login', credentials);
  }

  async logout() {
    this.clearToken();
  }

  // Item endpoints
  async getItems(filters = {}) {
    let query = '';
    if (filters.status) query += `?status=${filters.status}`;
    if (filters.category) query += `${query ? '&' : '?'}category=${filters.category}`;
    if (filters.campus) query += `${query ? ? '&' : '?'}campus=${filters.campus}`;
    if (filters.search) query += `${query ? '&' : '?'}search=${encodeURIComponent(filters.search)}`;
    return this.request('GET', `/items${query}`);
  }

  async getItemById(id) {
    return this.request('GET', `/items/${id}`);
  }

  async createItem(itemData) {
    const endpoint = itemData.status === 'found' ? '/items/found' : '/items/lost';
    return this.request('POST', endpoint, itemData);
  }

  async updateItem(id, itemData) {
    return this.request('PUT', `/items/${id}`, itemData);
  }

  async deleteItem(id) {
    return this.request('DELETE', `/items/${id}`);
  }

  // Claim endpoints
  async createClaim(claimData) {
    return this.request('POST', '/claims', claimData);
  }

  async getMyClaims() {
    return this.request('GET', '/claims/user/my-claims');
  }

  async getClaims(filters = {}) {
    let query = '';
    if (filters.status) query += `?status=${filters.status}`;
    return this.request('GET', `/claims${query}`);
  }

  async getClaimById(id) {
    return this.request('GET', `/claims/${id}`);
  }

  async updateClaim(id, claimData) {
    return this.request('PUT', `/claims/${id}`, claimData);
  }

  async getMyProfile() {
    return this.request('GET', '/auth/me');
  }
}

const apiService = new APIService();

// Make apiService globally accessible
window.apiService = apiService;
