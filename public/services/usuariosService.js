export async function obtenerUsuario(usuario, contrasena) {
  try {
    const resp = await fetch("http://localhost:3001/usuarios", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const usuarios = await resp.json();

    
    const encontrado = usuarios.find(u =>
      u.usuario === usuario && u.contrasena === contrasena
    );

    return encontrado || null;
  } catch (error) {
    console.error("Error al validar usuario:", error);
    throw error;
  }
}