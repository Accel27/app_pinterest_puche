export function validarEmail(email: string): string | null {
  const limpio = email.trim();
  if (!limpio) return 'El email es obligatorio';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(limpio)) return 'Email inválido';
  return null;
}

export function validarNombreUsuario(nombre: string): string | null {
  const limpio = nombre.trim();
  if (!limpio) return 'El nombre de usuario es obligatorio';
  if (limpio.length < 3) return 'Mínimo 3 caracteres';
  if (limpio.length > 20) return 'Máximo 20 caracteres';
  if (!/^[a-zA-Z0-9_]+$/.test(limpio)) {
    return 'Solo letras, números y guion bajo';
  }
  return null;
}

export function validarPassword(password: string): string | null {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 6) return 'Mínimo 6 caracteres';
  if (!/[A-Za-z]/.test(password)) return 'Debe tener al menos una letra';
  if (!/[0-9]/.test(password)) return 'Debe tener al menos un número';
  return null;
}

export function validarConfirmacion(
  password: string,
  confirmacion: string
): string | null {
  if (!confirmacion) return 'Confirma tu contraseña';
  if (password !== confirmacion) return 'Las contraseñas no coinciden';
  return null;
}