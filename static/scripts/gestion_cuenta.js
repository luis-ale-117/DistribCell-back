// @ts-ignore
const form = document.getElementById('form-datos-cuenta');
const linkBorrarCuenta = document.getElementById('linkBorrarCuenta');
const divActualizar = document.getElementById('divActualizar');
const divContrasenaActual = document.getElementById('divContrasenaActual');
const divRepiteNuevaContrasena = document.getElementById('divRepiteNuevaContrasena');
// @ts-ignore
const camposForm = Array.from(form?.elements);
const datosOriginales = {
  // @ts-ignore
  nombre: form?.nombre.value,
  // @ts-ignore
  apellido: form?.apellido.value,
  // @ts-ignore
  correo: form?.correo.value,
  nuevaContrasena: '',
  nuevaContrasena2: ''
};

// @ts-ignore
const divMensajes = document.getElementById('mensajes');
/**
 * Genera un mensaje en la interfaz
 * @param {string} mensaje
 * @param {string} tipo error, info, advertencia, exito
 */
function generaMensaje(mensaje, tipo = 'error') {
  if (!divMensajes) return;
  const divMensaje = document.createElement('div');
  divMensaje.classList.add('alerta');
  divMensaje.classList.add(tipo);
  divMensaje.textContent = mensaje;

  const botonCerrar = document.createElement('button');
  botonCerrar.classList.add('cerrar-mensaje');
  botonCerrar.textContent = 'Cerrar';
  botonCerrar.addEventListener('click', (_) => {
    botonCerrar.parentElement?.classList.add('invisible');
  });

  divMensaje.appendChild(botonCerrar);
  divMensajes.appendChild(divMensaje);
}

const sinCambiosEnCampos = (form) => {
  if (!form) return false;
  return (
    datosOriginales.nombre === form.nombre.value &&
    datosOriginales.apellido === form.apellido.value &&
    datosOriginales.nuevaContrasena === form.nuevaContrasena.value
  );
};
const sinCambiosEnConstrasena = (form) => {
  if (!form) return false;
  return datosOriginales.nuevaContrasena === form.nuevaContrasena.value;
};

camposForm.forEach((campo) => {
  if (campo.type === 'submit') return;
  campo.addEventListener('input', (_) => {
    if (sinCambiosEnCampos(form)) {
      divActualizar?.classList.add('invisible');
    } else {
      divActualizar?.classList.remove('invisible');
    }
    if (sinCambiosEnConstrasena(form)) {
      divContrasenaActual?.classList.add('invisible');
      divRepiteNuevaContrasena?.classList.add('invisible');
      divContrasenaActual?.removeAttribute('required');
      divRepiteNuevaContrasena?.removeAttribute('required');
    } else {
      divContrasenaActual?.classList.remove('invisible');
      divRepiteNuevaContrasena?.classList.remove('invisible');
      divContrasenaActual?.setAttribute('required', 'true');
      divRepiteNuevaContrasena?.setAttribute('required', 'true');
    }
  });
});

// @ts-ignore
const validar_datos = (form) => {
  if (form === null) {
    return 'Formulario no encontrado';
  }
  form.nombre.value = form.nombre.value.trim();
  form.apellido.value = form.apellido.value.trim();
  form.correo.value = form.correo.value.trim();

  const nombre = form.nombre.value;
  const apellido = form.apellido.value;
  const correo = form.correo.value;
  const nuevaContrasena = form.nuevaContrasena.value;
  const nuevaContrasena2 = form.nuevaContrasena2.value;
  const contrasenaActual = form.contrasenaActual.value;

  if (nombre === '') {
    return 'Nombre requerido';
  }
  if (apellido === '') {
    return 'Apellido requerido';
  }
  if (correo !== datosOriginales.correo) {
    return 'No se permite cambiar el correo';
  }
  if (nuevaContrasena !== '') {
    if (nuevaContrasena.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (nuevaContrasena !== nuevaContrasena2) {
      return 'Las contraseñas no son iguales';
    }
    if (contrasenaActual === '') {
      return 'Escribe la contraseña actual';
    }
  }
  return null;
};

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const mensaje = validar_datos(form);
  if (mensaje !== null) {
    generaMensaje(mensaje, 'error');
    return;
  }
  // @ts-ignore
  form.correo.value = '';
  // @ts-ignore
  form.submit();
});

linkBorrarCuenta?.addEventListener('click', (e) => {
  const mensaje = '¿Estás seguro de que quieres borrar tu cuenta?';
  if (!confirm(mensaje)) {
    e.preventDefault();
  }
});
