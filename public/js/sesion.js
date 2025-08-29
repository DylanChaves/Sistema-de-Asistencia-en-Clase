export const Sesion = {
  set(usuario) {
    const usuarioParaGuardar = {
      id: usuario.id,
      usuario: usuario.usuario,
      rol: usuario.rol
    };
    sessionStorage.setItem("usuario", JSON.stringify(usuarioParaGuardar));
  },

  get() {
    try {
      const textoUsuarioGuardado = sessionStorage.getItem("usuario");
      return JSON.parse(textoUsuarioGuardado);
    } catch {
      return null;
    }
  },

  clear() {
    sessionStorage.removeItem("usuario");
  }
};

export function protegerRuta(rolRequerido) {
  const usuarioEnSesion = Sesion.get();

  if (!usuarioEnSesion) {
    window.location.href = "/login";
    return null;
  }

  if (rolRequerido && usuarioEnSesion.rol !== rolRequerido) {
    const rutaSegunRol = usuarioEnSesion.rol === "profesor" ? "/profesor" : "/estudiante";
    window.location.href = rutaSegunRol;
    return null;
  }

  return usuarioEnSesion;
}

export function formatearFecha(fechaIso) {
  try {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString();
  } catch {
    return fechaIso ?? "";
  }
}