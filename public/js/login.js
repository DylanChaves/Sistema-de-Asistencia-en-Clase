import { obtenerUsuario } from "../services/usuariosService.js";
import { Sesion } from "./sesion.js";

const usuarioExistenteEnSesion = Sesion.get();
if (usuarioExistenteEnSesion) {
  const rutaSegunRol = usuarioExistenteEnSesion.rol === "profesor" ? "/profesor" : "/estudiante";
  window.location.href = rutaSegunRol;
}

const campoUsuario = document.getElementById("usuario");
const campoContrasena = document.getElementById("contrasena");
const botonIngresar = document.getElementById("btnIngresar");
const mensajeLogin = document.getElementById("msgLogin");

botonIngresar.addEventListener("click", async () => {
  const textoUsuario = (campoUsuario.value || "").trim();
  const textoContrasena = (campoContrasena.value || "").trim();

  if (!textoUsuario || !textoContrasena) {
    mensajeLogin.textContent = "Ingrese usuario y contraseña.";
    return;
  }

  mensajeLogin.textContent = "Validando...";
  botonIngresar.disabled = true;

  try {
    const usuarioValidado = await obtenerUsuario(textoUsuario, textoContrasena);
    if (!usuarioValidado) {
      mensajeLogin.textContent = "Credenciales incorrectas.";
      return;
    }

    Sesion.set(usuarioValidado);
    mensajeLogin.textContent = "Ingreso correcto. Redirigiendo...";
    const rutaSegunRol = usuarioValidado.rol === "profesor" ? "/profesor" : "/estudiante";
    window.location.href = rutaSegunRol;
  } catch (errorValidacion) {
    console.error(errorValidacion);
    mensajeLogin.textContent = "Error al iniciar sesión.";
  } finally {
    botonIngresar.disabled = false;
  }
});