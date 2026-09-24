'use client';
/** The admin key is kept only for this browser tab (sessionStorage) and sent as a header. */
const KEY = 'phonevault-admin-key';

export function getAdminKey(): string {
  try { return sessionStorage.getItem(KEY) ?? ''; } catch { return ''; }
}

export function setAdminKey(value: string): void {
  try { value ? sessionStorage.setItem(KEY, value) : sessionStorage.removeItem(KEY); } catch { /* private mode */ }
}
