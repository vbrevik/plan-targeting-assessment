import { getCsrfToken } from '@/features/auth/lib/auth';

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

class ApiClient {
    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { params, ...init } = options;

        let url = `${API_BASE}${endpoint}`;
        if (params) {
            const search = new URLSearchParams(params);
            url += `?${search.toString()}`;
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...init.headers,
        };

        // Add CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
        const method = init.method || 'GET';
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
            }
        }

        const response = await fetch(url, {
            ...init,
            headers,
            credentials: 'include', // Important for cookies (Auth)
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `API Error: ${response.status}`);
        }

        // Return empty object for 204 No Content
        if (response.status === 204) return {} as T;

        return response.json();
    }

    get<T>(endpoint: string, params?: Record<string, string>) {
        return this.request<T>(endpoint, { method: 'GET', params });
    }

    post<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
    }

    put<T>(endpoint: string, body: any) {
        return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
    }

    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient();
