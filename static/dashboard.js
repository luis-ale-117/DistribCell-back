const DeleteUser = document.getElementById("DeleteUser")

DeleteUser.addEventListener('click', async (e) => {
  e.preventDefault();
  confirm("¿Estas seguro que deseas eliminar tu usuario?")  
})
