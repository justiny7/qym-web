import { api } from '@/services/api';

export async function login(email: string, password: string) {
  const response = await api.login(email, password);
  localStorage.setItem('wsToken', response.wsToken);
  return await getCurrentUser();
}

export async function register(name: string, email: string, password: string) {
  await api.register(name, email, password);
  return await login(email, password);
}

export async function logout() {
  localStorage.removeItem('wsToken');
  return await api.logout();
}

export async function getCurrentUser() {
  try {
    return await api.getCurrentUser();
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
