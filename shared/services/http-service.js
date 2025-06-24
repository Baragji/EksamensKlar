/**
 * HTTP Service
 * Centralized HTTP request handling with error management and retry logic
 */

import { API_ENDPOINTS } from '../constants/app-constants.js';
import { generateId } from '../utilities/validation-utils.js';

class HttpService {
    constructor() {
        this.baseURL = API_ENDPOINTS.BASE_URL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    /**
     * Add request interceptor
     * @param {Function} interceptor - Request interceptor function
     */
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Add response interceptor
     * @param {Function} interceptor - Response interceptor function
     */
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Apply request interceptors
     * @param {Object} config - Request configuration
     * @returns {Object} Modified configuration
     */
    async applyRequestInterceptors(config) {
        let modifiedConfig = { ...config };
        
        for (const interceptor of this.requestInterceptors) {
            try {
                modifiedConfig = await interceptor(modifiedConfig);
            } catch (error) {
                console.warn('Request interceptor error:', error);
            }
        }
        
        return modifiedConfig;
    }

    /**
     * Apply response interceptors
     * @param {Response} response - Fetch response
     * @returns {Response} Modified response
     */
    async applyResponseInterceptors(response) {
        let modifiedResponse = response;
        
        for (const interceptor of this.responseInterceptors) {
            try {
                modifiedResponse = await interceptor(modifiedResponse);
            } catch (error) {
                console.warn('Response interceptor error:', error);
            }
        }
        
        return modifiedResponse;
    }

    /**
     * Build full URL
     * @param {string} endpoint - API endpoint
     * @returns {string} Full URL
     */
    buildURL(endpoint) {
        if (endpoint.startsWith('http')) {
            return endpoint;
        }
        return `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    }

    /**
     * Create request configuration
     * @param {string} method - HTTP method
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Object} Request configuration
     */
    createRequestConfig(method, endpoint, options = {}) {
        const config = {
            method: method.toUpperCase(),
            url: this.buildURL(endpoint),
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            },
            ...options
        };

        // Add request ID for tracking
        config.headers['X-Request-ID'] = generateId(16);

        // Handle request body
        if (config.data && config.method !== 'GET') {
            if (config.headers['Content-Type'] === 'application/json') {
                config.body = JSON.stringify(config.data);
            } else {
                config.body = config.data;
            }
        }

        return config;
    }

    /**
     * Execute HTTP request with retry logic
     * @param {Object} config - Request configuration
     * @param {number} attempt - Current attempt number
     * @returns {Promise} Request promise
     */
    async executeRequest(config, attempt = 1) {
        try {
            // Apply request interceptors
            const modifiedConfig = await this.applyRequestInterceptors(config);
            
            // Create fetch options
            const fetchOptions = {
                method: modifiedConfig.method,
                headers: modifiedConfig.headers,
                body: modifiedConfig.body,
                signal: modifiedConfig.signal,
                ...modifiedConfig.fetchOptions
            };

            // Execute request
            const response = await fetch(modifiedConfig.url, fetchOptions);
            
            // Apply response interceptors
            const modifiedResponse = await this.applyResponseInterceptors(response);
            
            // Handle response
            if (!modifiedResponse.ok) {
                throw new Error(`HTTP ${modifiedResponse.status}: ${modifiedResponse.statusText}`);
            }
            
            return modifiedResponse;
            
        } catch (error) {
            // Retry logic for network errors
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                console.warn(`Request failed (attempt ${attempt}/${this.retryAttempts}):`, error.message);
                await this.delay(this.retryDelay * attempt);
                return this.executeRequest(config, attempt + 1);
            }
            
            throw error;
        }
    }

    /**
     * Check if request should be retried
     * @param {Error} error - Request error
     * @returns {boolean} Should retry
     */
    shouldRetry(error) {
        // Retry on network errors, timeouts, and 5xx status codes
        return (
            error.name === 'TypeError' || // Network error
            error.name === 'AbortError' || // Timeout
            (error.message.includes('HTTP 5')) // Server error
        );
    }

    /**
     * Delay execution
     * @param {number} ms - Delay in milliseconds
     * @returns {Promise} Delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Parse response data
     * @param {Response} response - Fetch response
     * @returns {Promise} Parsed data
     */
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else if (contentType && contentType.includes('text/')) {
            return response.text();
        } else {
            return response.blob();
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Request promise
     */
    async get(endpoint, options = {}) {
        const config = this.createRequestConfig('GET', endpoint, options);
        const response = await this.executeRequest(config);
        return this.parseResponse(response);
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise} Request promise
     */
    async post(endpoint, data, options = {}) {
        const config = this.createRequestConfig('POST', endpoint, { ...options, data });
        const response = await this.executeRequest(config);
        return this.parseResponse(response);
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise} Request promise
     */
    async put(endpoint, data, options = {}) {
        const config = this.createRequestConfig('PUT', endpoint, { ...options, data });
        const response = await this.executeRequest(config);
        return this.parseResponse(response);
    }

    /**
     * PATCH request
     * @param {string} endpoint - API endpoint
     * @param {any} data - Request data
     * @param {Object} options - Request options
     * @returns {Promise} Request promise
     */
    async patch(endpoint, data, options = {}) {
        const config = this.createRequestConfig('PATCH', endpoint, { ...options, data });
        const response = await this.executeRequest(config);
        return this.parseResponse(response);
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Request promise
     */
    async delete(endpoint, options = {}) {
        const config = this.createRequestConfig('DELETE', endpoint, options);
        const response = await this.executeRequest(config);
        return this.parseResponse(response);
    }

    /**
     * Upload file
     * @param {string} endpoint - Upload endpoint
     * @param {File|FormData} file - File to upload
     * @param {Object} options - Upload options
     * @returns {Promise} Upload promise
     */
    async upload(endpoint, file, options = {}) {
        const formData = file instanceof FormData ? file : new FormData();
        if (!(file instanceof FormData)) {
            formData.append('file', file);
        }

        const config = this.createRequestConfig('POST', endpoint, {
            ...options,
            data: formData,
            headers: {
                ...options.headers
                // Don't set Content-Type for FormData, let browser set it
            }
        });
        
        // Remove Content-Type header for file uploads
        delete config.headers['Content-Type'];
        
        const response = await this.executeRequest(config);
        return this.parseResponse(response);
    }

    /**
     * Cancel request
     * @param {AbortController} controller - Abort controller
     */
    cancel(controller) {
        if (controller && typeof controller.abort === 'function') {
            controller.abort();
        }
    }

    /**
     * Create abort controller for request cancellation
     * @returns {AbortController} Abort controller
     */
    createAbortController() {
        return new AbortController();
    }
}

// Create and export singleton instance
export const httpService = new HttpService();
export default httpService;