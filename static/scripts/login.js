
const form = document.getElementById('form-inicio-sesion');

const validar_datos = form => {
  let correo = form?.email.value
  let contrasena = form?.password.value
  if(correo === ''){
    alert('Correo requerido')
    return false
  }
  if(contrasena === ''){
    alert('Contraseña requerida')
    return false
  }
  return true
}

form?.addEventListener('submit',  e => {
  e.preventDefault();
  if (!validar_datos(form)){
    return
  }
  form.submit()
})
