import http from './http';

export function login(email, senha) {
  return http.post('/auth/login', { email, senha }).then((res) => res.data);
}

export function me() {
  return http.get('/auth/me').then((res) => res.data);
}
