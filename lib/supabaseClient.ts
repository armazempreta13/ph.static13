
/**
 * Supabase Client - Desativado
 * Este projeto está em modo local sem backend
 * Todos os dados são salvos em localStorage
 */

export const supabase = null;

export const checkConnection = async () => {
  // Modo local. Sempre retorna true
  return true;
};
