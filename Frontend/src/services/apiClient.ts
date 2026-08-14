// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

/**
 * AgroTrack — Cliente HTTP centralizado para comunicación con el Backend .NET API.
 * Maneja reintentos, timeouts y detección de conectividad.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
}

class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl: string = API_BASE_URL, timeoutMs: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Verifica si hay conexión con el servidor backend.
   */
  async isServerReachable(): Promise<boolean> {
    if (!navigator.onLine) return false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${this.baseUrl}/configuracion`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Realiza una petición HTTP genérica con timeout.
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!navigator.onLine) {
      return { ok: false, error: 'Sin conexión a internet.' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMsg: string;
        try {
          const parsed = JSON.parse(errorBody);
          errorMsg = parsed.error || parsed.title || `Error ${response.status}`;
        } catch {
          errorMsg = errorBody || `Error HTTP ${response.status}`;
        }
        return { ok: false, error: errorMsg, status: response.status };
      }

      // Algunas respuestas no tienen body (204 No Content)
      if (response.status === 204) {
        return { ok: true };
      }

      const data = await response.json() as T;
      return { ok: true, data };
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return { ok: false, error: 'La petición tardó demasiado (timeout).' };
      }
      return { ok: false, error: err.message || 'Error de red desconocido.' };
    }
  }

  // ── Atajos ──

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

}

export const apiClient = new ApiClient();
