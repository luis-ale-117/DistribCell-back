const wrapper = document.querySelector('.wrapper');
const signInLink = document.querySelector('.SigninLink');
const signUpLink = document.querySelector('.SignupLink');
const iconClose = document.querySelector('.icon-close');
//const iconClose = document.querySelector('iconClose');
const login = document.getElementById('btnLogin-popup');


signUpLink.addEventListener('click', () => {
    wrapper.classList.add('active');
});

signInLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
});

login.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', () => {
    console.log(remove)
    wrapper.classList.remove('active-popup');
});