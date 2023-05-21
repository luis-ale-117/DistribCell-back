var configuration = document.getElementById('btnConfiguration')
var popup = document.getElementById('form-container')
var closeConfig = document.getElementById('closeConfig')
console.log(configuration, popup, closeConfig)
configuration.addEventListener('click', () => {
    popup.style.display = 'block';
});
closeConfig.addEventListener('click', () => {
    popup.style.display = 'none';
})
