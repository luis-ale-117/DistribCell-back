
const configuration = document.getElementById('btnConfiguration')
const popup = document.getElementById('form-container')
const closeConfig = document.getElementById('closeConfig')

configuration?.addEventListener('click', () => {
    if (popup === null){
        return
    }
    if (popup.classList.contains('invisible')){
        popup.classList.replace('invisible', 'visible')
    }
    else {
        popup.classList.add('visible')
    }
});
closeConfig?.addEventListener('click', () => {
    if (popup === null){
        return
    }
    if (popup.classList.contains('visible')){
        popup.classList.replace('visible', 'invisible')
    }
    else {
        popup.classList.add('invisible')
    }
})
