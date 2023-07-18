
// @ts-ignore
const form = document.getElementById('form-datos-cuenta');
const divActualizar = document.getElementById('divActualizar')
const divContrasenaActual = document.getElementById('divContrasenaActual')
const divRepiteNuevaContrasena = document.getElementById('divRepiteNuevaContrasena')
// @ts-ignore
const camposForm = Array.from(form?.elements)
const datosOriginales = {
  // @ts-ignore
  nombre: form?.nombre.value,
  // @ts-ignore
  apellido: form?.apellido.value,
  // @ts-ignore
  correo: form?.correo.value,
  nuevaContrasena: '',
  nuevaContrasena2: ''
}

const sinCambiosEnCampos = form =>  {
  if (!form) return false;
  return datosOriginales.nombre === form.nombre.value &&
    datosOriginales.apellido === form.apellido.value &&
    datosOriginales.correo === form.correo.value &&
    datosOriginales.nuevaContrasena === form.nuevaContrasena.value
}
const sinCambiosEnConstrasena = form =>  {
  if (!form) return false;
  return datosOriginales.nuevaContrasena === form.nuevaContrasena.value
}
camposForm.forEach(campo => {
  if (campo.type === 'submit') return;
  campo.addEventListener('input', _ => {
    if (sinCambiosEnCampos(form)){
      divActualizar?.classList.add('invisible')
    }
    else {
      divActualizar?.classList.remove('invisible')
    }
    if (sinCambiosEnConstrasena(form)) {
      divContrasenaActual?.classList.add('invisible')
      divRepiteNuevaContrasena?.classList.add('invisible')
      divContrasenaActual?.removeAttribute('required')
      divRepiteNuevaContrasena?.removeAttribute('required')
    }
    else {
      divContrasenaActual?.classList.remove('invisible')
      divRepiteNuevaContrasena?.classList.remove('invisible')
      divContrasenaActual?.setAttribute('required', 'true')
      divRepiteNuevaContrasena?.setAttribute('required', 'true')
    }
  })
})



// @ts-ignore
const validar_datos = form => {
  if (form === null) {
    alert('Formualrio no encontrado')
    return false
  }
  form.nombre.value = form.nombre.value.trim()
  form.apellido.value = form.apellido.value.trim()
  form.correo.value = form.correo.value.trim()

  const nombre = form.nombre.value
  const apellido = form.apellido.value
  const correo = form.correo.value
  const nuevaContrasena = form.nuevaContrasena.value
  const nuevaContrasena2 = form.nuevaContrasena2.value

  if (nombre === '') {
    alert('Nombre requerido')
    return false
  }
  if (apellido === '') {
    alert('Apellido requerido')
    return false
  }
  if (correo !== datosOriginales.correo) {
    alert('No se puede cambiar el correo')
    return false
  }
  if (nuevaContrasena === '') {
    alert('Contraseña requerida')
    return false
  }
  if (nuevaContrasena !== nuevaContrasena2) {
    alert('Las contraseñas no son iguales')
    return false
  }

  return true
}

form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!validar_datos(form)) {
    return
  }

})
