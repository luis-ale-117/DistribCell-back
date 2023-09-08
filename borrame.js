const mitab = document.getElementById('mitab');
const FILAS = 10;

const fragment = document.createDocumentFragment();

for (let i = 0; i < FILAS; i++) {
    const fila = document.createElement('tr');
    fila.setAttribute('draggable', 'true');
    fila.id = 'fila-'+i.toString();

    const data = document.createElement('td');
    data.textContent = i.toString();
    fila.appendChild(data);

    const efecto = document.createElement('td');
    efecto.textContent = 'Imprime-'+i.toString();
    efecto.addEventListener('click', function(e) {
        console.log('Imprime-'+fila.id)
    });

    fila.appendChild(efecto);
    fragment.appendChild(fila);
}

mitab?.addEventListener('dragstart', function(e) {
    e.dataTransfer?.setData('text/plain', e.target.id);
});
mitab?.addEventListener('drag', function(e) {
    e.target.classList.add('active');
});
mitab?.addEventListener('dragend', function(e) {
    e.target.classList.remove('active');
});
mitab?.addEventListener('dragenter', function(e) {
    if(e.target.tagName === 'TD') {
        e.target.parentNode.classList.add('over');
    }
    else{
        e.target.classList.add('over');
    }
});
mitab?.addEventListener('dragleave', function(e) {
    if(e.target.tagName === 'TD') {
        e.target.parentNode.classList.remove('over');
    }
    else{
        e.target.classList.remove('over');
    }
});

mitab?.addEventListener('dragover', function(e) {
    e.preventDefault();
});
mitab?.addEventListener('drop', function(e) {
    e.preventDefault();
    if (e.target.tagName !== 'TD' && e.target.tagName !== 'TR') {
        return;
    }
    let destino;
    if(e.target.tagName === 'TD') {
        e.target.parentNode.classList.remove('over');
        destino = e.target.parentNode;
    }
    else{
        e.target.classList.remove('over');
        destino = e.target;
    }
    const hermanos = Array.from(destino?.parentNode?.children);
    const elemento = document.getElementById(e.dataTransfer?.getData('text/plain'));
    // Print indexes of elements
    if (hermanos.indexOf(elemento) < hermanos.indexOf(destino)) {
        destino.after(elemento);
    }
    else{
        destino.before(elemento);
    }
});

mitab?.appendChild(fragment);
