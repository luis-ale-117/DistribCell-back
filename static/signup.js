const form = document.querySelector('.register-form');
const notMatch = document.getElementById('error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    const password_confirmed = form.password_confirmed.value;
    const name = form.name.value;
    const lastname = form.lastname.value;
    if(password !== password_confirmed){
        notMatch.innerText = 'Las contraseñas no coinciden'
    }
    else{
        notMatch.innerText = ''
        form.email.value=''
        form.password.value=''
        form.password_confirmed.value=''
        form.name.value=''
        form.lastname.value=''
        let user = {
            email,
            password,
            name,
            lastname
          };
          //try the conection  
          fetch('/signup', {
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
                  //navegate("/");
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
    }
})
