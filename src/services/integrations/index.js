import { createStore, useStore } from '@/lib/store.js';
import { apiIntegrations } from './apiDriver.js';
import { localIntegrations } from './localDriver.js';

const driver = import.meta.env.VITE_API_URL ? apiIntegrations : localIntegrations;
export const integrationState = createStore({ drive: { state: 'disconnected' }, calendar: { state: 'disconnected' }, loading: false, error: '' });
export const useIntegrations = (selector = (value) => value) => useStore(integrationState, selector);
export async function refreshIntegrations() { integrationState.set({ loading: true, error: '' }); try { const value = await driver.status(); integrationState.set({ ...value, loading: false }); return value; } catch (error) { integrationState.set({ loading: false, error: error.message }); return null; } }
export async function connectIntegration(provider) { return driver.connect(provider, window.location.href); }
export async function disconnectIntegration(provider) { const value = await driver.disconnect(provider); await refreshIntegrations(); return value; }
export const integrationDriver = driver;
