const form = document.querySelector('.login-form');
const error = document.querySelector('.error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.email.value;
  const password = form.password.value;
  let user = {
    email,
    password
  };
  fetch('/login', {
    method: 'POST',
    body: JSON.stringify({ user: user }),
    headers: { 'Content-Type': 'application/json' }
  })
    //get response
    .then(res => res.ok ? Promise.resolve(res) : Promise.reject(res))
    .then(res => res.json())
    .then(data => {
      if (data != null) { //if data
        if (data['Error']) {
          alert(data['Error']);
        }
        else {
          alert(data['Mensaje'])
        }
      }
      else { //if data is null
        alert('Algo salio mal')
      }
    })
    //get server error
    .catch(err => {
      console.log(err.status);
      err.json()
        .then(data => {
          console.log("Solicitud fallida ", data);
        })
        .catch(_ => console.log("Error"));
    });
})
