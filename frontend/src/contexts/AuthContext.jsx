import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const armazenado = localStorage.getItem('sarc2_usuario');
    return armazenado ? JSON.parse(armazenado) : null;
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sarc2_token');
    if (!token) {
      setCarregando(false);
      return;
    }
    authApi
      .me()
      .then(({ usuario: identidade }) => {
        setUsuario(identidade);
        localStorage.setItem('sarc2_usuario', JSON.stringify(identidade));
      })
      .catch(() => {
        localStorage.removeItem('sarc2_token');
        localStorage.removeItem('sarc2_usuario');
        setUsuario(null);
      })
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(email, senha) {
    const { token, usuario: dadosUsuario } = await authApi.login(email, senha);
    localStorage.setItem('sarc2_token', token);
    localStorage.setItem('sarc2_usuario', JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);
    return dadosUsuario;
  }

  function sair() {
    localStorage.removeItem('sarc2_token');
    localStorage.removeItem('sarc2_usuario');
    setUsuario(null);
  }

  const value = useMemo(
    () => ({
      usuario,
      carregando,
      autenticado: Boolean(usuario),
      entrar,
      sair,
    }),
    [usuario, carregando],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return context;
}
