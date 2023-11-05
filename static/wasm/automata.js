// @ts-nocheck
const divMensajes = document.getElementById('mensajes');
const botonPausa = document.getElementById('botonPausa');
const formConfiguracion = document.getElementById('formConfiguracion');
const formReglas = document.getElementById('formReglas');
const listaReglas = document.getElementById('listaReglas');
const tabColorEstados = document.getElementById('tabColorEstados');
const rangoVelocidad = document.getElementById('rangoVelocidad');
const imgPausa = document.getElementById('imgPausa');
const rangoHistorialAutomata = document.getElementById('rangoHistorialAutomata');
const labelRangoHistorialAutomata = document.getElementById('labelRangoHistorialAutomata');
const botonGuardarHistorial = document.getElementById('botonGuardarHistorial');
const botonProcesarAutomata = document.getElementById('botonProcesarAutomata');

const IMAGEN_PAUSA = "/static/imgs/boton-de-pausa.png";
const IMAGEN_PLAY = "/static/imgs/boton-de-play.png";

/**
 * @type {HTMLCanvasElement}
 */
const canvasGrid = document.getElementById('canvasGrid');
const ctx = canvasGrid.getContext('2d');
const TAM_CELDA = 20;  // Tamaño de la celda en píxeles
/**
 * @type {HTMLCanvasElement}
 */
const canvasGrafica1 = document.getElementById('canvasGrafica1');
const ctxGrafica1 = canvasGrafica1.getContext('2d');
const botonGrafica1 = document.getElementById('botonGrafica1');
/**
 * @type {Chart}
 */
let grafica1;
const plugin = { // plugin para poner un fondo gris en la gráfica
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || 'lightGrey'; // default color is light grey
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

// Metodo para mover un elemento en un array
Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
}

const go = new Go();
fetch('/static/wasm/main.wasm') // Path to the WebAssembly binary file
  .then(response => response.arrayBuffer())
  .then(buffer => {
    if (WebAssembly.validate(buffer)) {
      WebAssembly.instantiate(buffer, go.importObject).then(result => {
        go.run(result.instance);
        let colorEstados = ["#000000", "#ffffff"]
        let estadoSeleccionado = "0"
        let estadoSeleccionadoInterfaz = null
        let velocidadEjecucion = 1000
        /**
         * @type {number[][][]}
         */
        let historialAutomata = []
        const conf = {
          numEstados: parseInt(formConfiguracion.elements['numEstados'].value),
          anchura: parseInt(formConfiguracion.elements['anchura'].value),
          altura: parseInt(formConfiguracion.elements['altura'].value)
        }
        const automata = CellularAumtomaton(conf.numEstados, conf.anchura, conf.altura)
        // Por defecto haz un automata celular del juego de la vida de Conway
        let reglas = [
          Rule2d("n11 == 1 && (s1 == 2 || s1 == 3)", 1),
          Rule2d("n11 == 0 && s1 == 3", 1),
          Rule2d("0==0", 0)
        ]
        let ejecutando = false
        imgPausa.src = ejecutando ? IMAGEN_PAUSA : IMAGEN_PLAY

        cargarReglasInterfaz(reglas)
        cargarColorEstadosInterfaz(colorEstados)
        estadoSeleccionadoInterfaz = tabColorEstados.firstChild?.firstChild
        estadoSeleccionadoInterfaz.classList.add('seleccionado')
        automata.setRules(reglas)
        // Por defecto haz una matriz aleatoria
        err = automata.loadInitGrid(matrizAleatoria(conf.anchura, conf.altura, conf.numEstados))
        if (err != null) {
          generaMensaje(`Error al cargar la matriz inicial ${err}`, "error");
          return
        }
        matrizCelulas = automata.getInitGrid()
        // Haz una copia de la matriz para poder modificarla
        matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))
        // Carga la matriz en la interfaz por primera vez
        canvasGrid.width = conf.anchura * TAM_CELDA
        canvasGrid.height = conf.altura * TAM_CELDA
        dibujaMatrizInterfaz(matrizCelulas)
        agregaHistorial(matrizCelulas)

        ejecutaAutomata();

        //////////////////////////////////////////////
        ////////// Funciones auxiliares //////////////
        //////////////////////////////////////////////

        /**
         * Genera un mensaje en la interfaz
         * @param {string} mensaje 
         * @param {string} tipo error, info, advertencia, exito
         */
        function generaMensaje(mensaje, tipo = "error") {
          const divMensaje = document.createElement('div');
          divMensaje.classList.add('alerta');
          divMensaje.classList.add(tipo);
          divMensaje.textContent = mensaje;

          const botonCerrar = document.createElement('button');
          botonCerrar.classList.add('cerrar-mensaje');
          botonCerrar.textContent = 'Cerrar';
          botonCerrar.addEventListener('click', _ => {
            botonCerrar.parentElement?.classList.add('invisible');
          });

          divMensaje.appendChild(botonCerrar);
          divMensajes.appendChild(divMensaje);
        }
        function matrizAleatoria(anchura, altura, numEstados) {
          let matrix = [];
          for (let i = 0; i < altura; i++) {
            let row = [];
            for (let j = 0; j < anchura; j++) {
              row.push(Math.floor(Math.random() * numEstados));
            }
            matrix.push(row);
          }
          return matrix;
        }
        function dibujaMatrizInterfaz(matrizCelulas) {
          ctx.clearRect(0, 0, canvasGrid.width, canvasGrid.height);
          for (let fila = 0; fila < matrizCelulas.length; fila++) {
            for (let columna = 0; columna < matrizCelulas[0].length; columna++) {
              ctx.fillStyle = colorEstados[matrizCelulas[fila][columna]];
              ctx.fillRect(columna * TAM_CELDA, fila * TAM_CELDA, TAM_CELDA, TAM_CELDA);
            }
          }
        }
        function cargarReglasInterfaz(reglas) {
          while (listaReglas.firstChild) {
            listaReglas.removeChild(listaReglas.firstChild);
          }

          const fragment = document.createDocumentFragment()
          const tituloCondicion = document.createElement('th')
          const tituloEstado = document.createElement('th')
          const tituloBorrar = document.createElement('th')
          tituloCondicion.textContent = "Condición"
          tituloEstado.textContent = "Estado"
          tituloBorrar.textContent = "Borrar"

          const filaTitulo = document.createElement('tr')
          filaTitulo.appendChild(tituloCondicion)
          filaTitulo.appendChild(tituloEstado)
          filaTitulo.appendChild(tituloBorrar)
          fragment.appendChild(filaTitulo)

          for (let i = 0; i < reglas.length; i++) {
            const regla = document.createElement('tr');
            regla.setAttribute('draggable', 'true')
            regla.id = 'regla-' + i.toString()

            const condicion = document.createElement('td');
            condicion.textContent = reglas[i].condition
            regla.appendChild(condicion)

            const estado = document.createElement('td')
            estado.textContent = reglas[i].state
            regla.appendChild(estado)

            const tdBotonBorrar = document.createElement('td')
            tdBotonBorrar.dataset.tipo = "borrar"
            tdBotonBorrar.dataset.posicion = i

            const imgCerrar = document.createElement('img')
            imgCerrar.src = "/static/imgs/cerrar.png"
            tdBotonBorrar.appendChild(imgCerrar)

            regla.appendChild(tdBotonBorrar)
            fragment.appendChild(regla)
          }
          listaReglas.appendChild(fragment)
        }
        function cargarColorEstadosInterfaz(colorEstados) {
          while (tabColorEstados.firstChild) {
            tabColorEstados.removeChild(tabColorEstados.firstChild);
          }

          const filaEtiquetaEstados = document.createElement('tr')
          const filaColorEstados = document.createElement('tr')
          for (let i = 0; i < colorEstados.length; i++) {
            const estado = document.createElement('td')
            estado.textContent = i
            estado.dataset.estado = i
            estado.addEventListener('click', () => {
              if (estadoSeleccionadoInterfaz != null) {
                // Quita la clase seleccionado al estado seleccionado anteriormente
                estadoSeleccionadoInterfaz.classList.remove('seleccionado')
              }
              // Añade la clase seleccionado al estado seleccionado
              estadoSeleccionadoInterfaz = estado
              estado.classList.add('seleccionado')
              estadoSeleccionado = estado.dataset.estado

            })

            const colorPicker = document.createElement('input')
            colorPicker.id = 'colorPicker-' + i.toString()
            colorPicker.setAttribute('type', 'color')
            colorPicker.value = colorEstados[i]
            colorPicker.dataset.estado = i
            colorPicker.addEventListener('change', () => {
              colorEstados[colorPicker.dataset.estado] = colorPicker.value
              dibujaMatrizInterfaz(matrizCelulas)
            })

            const color = document.createElement('td')
            color.appendChild(colorPicker)
            filaEtiquetaEstados.appendChild(estado)
            filaColorEstados.appendChild(color)
          }
          const fragment = document.createDocumentFragment()
          fragment.appendChild(filaEtiquetaEstados)
          fragment.appendChild(filaColorEstados)
          tabColorEstados.appendChild(fragment)
        }
        function hslToHex(h, s, l) {
          // Convert hue to degrees
          h /= 360;
          // Convert saturation and lightness to 0-1 range
          s /= 100;
          l /= 100;
          // Calculate RGB values
          let r, g, b;
          if (s === 0) {
            r = g = b = l;
          } else {
            const hueToRgb = (p, q, t) => {
              if (t < 0) t += 1;
              if (t > 1) t -= 1;
              if (t < 1 / 6) return p + (q - p) * 6 * t;
              if (t < 1 / 2) return q;
              if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
              return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
          }
          // Convert RGB values to hex format
          const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          };
          return "#" + toHex(r) + toHex(g) + toHex(b);
        }
        function asignaColorArcoiris(numEstados, saturation = 100, lightness = 50) {
          const hueIncrement = 360 / numEstados
          let hue = 0
          colorEstados = []
          for (let i = 0; i < numEstados; i++) {
            const color = hslToHex(hue, saturation, lightness)
            colorEstados.push(color)
            hue += hueIncrement
          }
        }
        function agregaHistorial(matrizCelulas) {
          historialAutomata.push(matrizCelulas)
          rangoHistorialAutomata.max = historialAutomata.length - 1
          rangoHistorialAutomata.value = historialAutomata.length - 1
          labelRangoHistorialAutomata.textContent = `Generación ${historialAutomata.length - 1} de ${historialAutomata.length - 1} `
        }
        function reiniciaHistorial() {
          historialAutomata = []
          rangoHistorialAutomata.max = 0
          rangoHistorialAutomata.value = 0
          labelRangoHistorialAutomata.textContent = `Generación 0 de 0 `
        }
        async function ejecutaAutomata() {
          // Ejecuta el automata
          while (true) {
            if (!ejecutando) {
              // Espera 100ms si no se está ejecutando
              await new Promise(r => setTimeout(r, 100));
              continue
            }
            // Espera de acuerdo a la velocidad de ejecución
            await new Promise(r => setTimeout(r, velocidadEjecucion));
            err = automata.step()
            if (err != null) {
              console.error("Error:", err)
              // TODO: Error como mensaje, no como alert
              generaMensaje(`Ocurrio un error, revisa tus reglas: ${err}`, "error");
              ejecutando = false;
              imgPausa.src = IMAGEN_PLAY
              continue
            }
            matrizCelulas = automata.getInitGrid()
            matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))
            agregaHistorial(matrizCelulas)

            dibujaMatrizInterfaz(matrizCelulas)
          }
        }
        /**
        * Cuenta el número de células por estado en una matriz de células
        * @param {number[][]} matrizCelulas
        * @returns {number[]} arreglo con el número de células por estado
        */
        function cuentaEstados(matrizCelulas) {
          const numEstados = conf.numEstados;
          const cuenta = new Array(numEstados).fill(0);
          for (let j = 0; j < conf.altura; j++) {
            for (let k = 0; k < conf.anchura; k++) {
              cuenta[matrizCelulas[j][k]]++;
            }
          }
          return cuenta;
        }
        /**
         * Inicializa la gráfica con el número de células por estado
         * @param {Chart} grafica1 - Gráfica
         * @param {number} numEstados - Número de estados
         * @param {string[]} colorEstados - Arreglo con los colores de cada estado
         * @returns {Chart} Gráfica inicializada
         */
        function inicializaGrafica(ctxGrafica1, numEstados, colorEstados) {
          const labels = [];
          const datasets = [];
          for (let i = 0; i < numEstados; i++) {
            datasets.push({
              label: i.toString(),
              data: new Array(0),
              fill: false,
              borderColor: colorEstados[i],
              tension: 0.1
            })
          }
          return new Chart(ctxGrafica1, {
            type: 'line',
            data: {
              labels,
              datasets
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                customCanvasBackgroundColor: {
                  color: 'lightGrey',
                }
              }
            },
            plugins: [plugin],
          });
        }
        /**
         * Actualiza la gráfica con el número de células por estado
         * @param {Chart} grafica1
         * @param {number[]} celulasPorEstado
         */
        function agregaDatosGrafica(grafica1, celulasPorEstado) {
          grafica1.data.labels.push(grafica1.data.labels.length);
          for (let i = 0; i < celulasPorEstado.length; i++) {
            grafica1.data.datasets[i].data.push(celulasPorEstado[i]);
          }
        }
        botonPausa.addEventListener('click', () => {
          ejecutando = !ejecutando
          imgPausa.src = ejecutando ? IMAGEN_PAUSA : IMAGEN_PLAY
        })
        //////////////////////////////////////////////
        ////////// Eventos de la interfaz ////////////
        //////////////////////////////////////////////

        formConfiguracion.addEventListener('submit', (e) => {
          e.preventDefault()
          conf.numEstados = parseInt(formConfiguracion.elements['numEstados'].value)
          conf.anchura = parseInt(formConfiguracion.elements['anchura'].value)
          conf.altura = parseInt(formConfiguracion.elements['altura'].value)
          automata.updateConfig(conf.numEstados, conf.anchura, conf.altura)
          // Default (Conway's game of life) TODO: Load from USER
          automata.setRules(reglas)
          err = automata.loadInitGrid(matrizAleatoria(conf.anchura, conf.altura, conf.numEstados))
          if (err != null) {
            generaMensaje(`Error cargando la matriz ${err}`, "error");
            ejecutando = false;
            return
          }
          matrizCelulas = automata.getInitGrid()
          matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))

          reiniciaHistorial()
          agregaHistorial(matrizCelulas)

          asignaColorArcoiris(conf.numEstados)
          cargarColorEstadosInterfaz(colorEstados)

          estadoSeleccionadoInterfaz = tabColorEstados.firstChild?.firstChild
          estadoSeleccionadoInterfaz.classList.add('seleccionado')
          canvasGrid.width = conf.anchura * TAM_CELDA
          canvasGrid.height = conf.altura * TAM_CELDA
          dibujaMatrizInterfaz(matrizCelulas)
        })
        formReglas.addEventListener('submit', (e) => {
          e.preventDefault()
          condicion = formReglas.elements['condicion'].value
          estado = parseInt(formReglas.elements['estado'].value)
          if (condicion == "") {
            return
          }
          reglas.push(Rule2d(condicion, estado))
          cargarReglasInterfaz(reglas)
          automata.setRules(reglas)
          formReglas.elements['condicion'].value = ""
          formReglas.elements['estado'].value = ""
          let matrizCelulas = automata.getInitGrid()
          matrizCelulas = JSON.parse(JSON.stringify(matrizCelulas))
          reiniciaHistorial()
          agregaHistorial(matrizCelulas)
        })
        rangoVelocidad.addEventListener('change', (e) => {
          velocidadEjecucion = parseInt(e.target.value)
        })
        canvasGrid.addEventListener('mousedown', (e) => {
          const x = Math.floor(e.offsetX / TAM_CELDA)
          const y = Math.floor(e.offsetY / TAM_CELDA)
          nuevoEstado = parseInt(estadoSeleccionado)
          matrizCelulas[y][x] = nuevoEstado
          automata.updateCellState(x, y, nuevoEstado)
          ctx.fillStyle = colorEstados[nuevoEstado];
          ctx.fillRect(x * TAM_CELDA, y * TAM_CELDA, TAM_CELDA, TAM_CELDA);
        });
        listaReglas.addEventListener('dragstart', (e) => {
          e.dataTransfer?.setData('text/plain', e.target.id);
          const elementosHermanos = Array.from(e.target?.parentNode?.children);
          const indiceElemento = elementosHermanos.indexOf(e.target);
        });
        listaReglas.addEventListener('drag', (e) => {
          e.target.classList.add('opaco');
        });
        listaReglas.addEventListener('dragend', (e) => {
          e.target.classList.remove('opaco');
        });
        listaReglas.addEventListener('dragenter', (e) => {
          if (e.target.tagName === 'TD') {
            e.target.parentNode.classList.add('seleccionado');
          }
          else if (e.target.tagName === 'TR') {
            e.target.classList.add('seleccionado');
          }
        });
        listaReglas.addEventListener('dragleave', (e) => {
          if (e.target.tagName === 'TD') {
            e.target.parentNode.classList.remove('seleccionado');
          }
          else if (e.target.tagName === 'TR') {
            e.target.classList.remove('seleccionado');
          }
        });
        listaReglas.addEventListener('dragover', (e) => {
          e.preventDefault();
        });
        listaReglas.addEventListener('drop', (e) => {
          e.preventDefault();
          if (e.target.tagName !== 'TD' && e.target.tagName !== 'TR') {
            return;
          }
          let destino;
          if (e.target.tagName === 'TD') {
            e.target.parentNode.classList.remove('seleccionado');
            destino = e.target.parentNode;
          }
          else {
            e.target.classList.remove('seleccionado');
            destino = e.target;
          }
          const elemento = document.getElementById(e.dataTransfer?.getData('text/plain'));
          const elementosHermanos = Array.from(destino?.parentNode?.children);
          const indiceElemento = elementosHermanos.indexOf(elemento);
          const indiceDestino = elementosHermanos.indexOf(destino);
          if (indiceElemento < indiceDestino) {
            destino.after(elemento);
          }
          else {
            destino.before(elemento);
          }
          reglas.move(indiceElemento - 1, indiceDestino - 1) // -1 porque el primer elemento es el titulo
          automata.setRules(reglas)
        });
        listaReglas.addEventListener('click', (e) => {
          if (e.target.tagName !== 'IMG' && e.target.tagName !== 'TD') {
            return;
          }
          let borrar;
          if (e.target.tagName === 'IMG') {
            borrar = e.target.parentNode;
          }
          else {
            borrar = e.target;
          }
          if (borrar.dataset.tipo === "borrar") {
            reglas.splice(parseInt(e.target.dataset.posicion), 1);
            cargarReglasInterfaz(reglas);
            automata.setRules(reglas);
          }
        });
        rangoHistorialAutomata.addEventListener('input', (e) => {
          const indice = parseInt(e.target.value)
          const matrizCelulas = historialAutomata[indice]
          if (matrizCelulas === undefined) {
            generaMensaje("No hay un historial para esa generación", "error");
            return;
          }
          labelRangoHistorialAutomata.textContent = `Generación ${indice} de ${historialAutomata.length - 1} `
          dibujaMatrizInterfaz(matrizCelulas)
        });
        botonGuardarHistorial?.addEventListener('click', async () => {
          // popup para guardar el nombre del historial
          const nombreHistorial = prompt("Ingresa el nombre del historial")
          const descripcionHistorial = prompt("Ingresa una descripción para el historial") // Opcional
          if (nombreHistorial === null || nombreHistorial === "") {
            generaMensaje("Agrega un nombre a tu simulación", "advertencia");
            return;
          }
          // Paso 1: Crea la simulación
          const simulacion = {
            nombre: nombreHistorial,
            descripcion: descripcionHistorial,
            altura: conf.altura,
            anchura: conf.anchura,
            estados: conf.numEstados,
            reglas: reglas,
          }
          console.log(simulacion);
          let msgError = validaSimulacion(simulacion);
          if (msgError) {
            generaMensaje(msgError, "error");
            return;
          }
          for (const matriz of historialAutomata) {
            msgError = validaMatriz(simulacion, matriz);
            if (msgError) {
              generaMensaje(msgError, "error");
              return;
            }
          }
          let nuevaSimulacionId = null;
          let error = null;
          await fetch('/simulaciones', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(simulacion)
          })
            .then(response => {
              if (!response.redirected) {
                return response.json();
              }
              alert("Inicio de sesion requerido")
              window.location.href = response.url;
            })
            .then(data => {
              console.log(data);
              nuevaSimulacionId = data.simulacion_id
            })
            .catch(err => {
              console.error(err);
              error = err;
              generaMensaje(`Error al guardar la simulación: ${err}`, "error");
              return;
            });
          if (error) {
            return;
          }

          // Paso 2: Guarda el historial usando la simulacion creada
          // Envia el historial en bloques de 10 generaciones
          let historial = [];
          for (let i = 0; i < historialAutomata.length; i++) {

            historial.push(historialAutomata[i])
            if (historial.length === 10 || i === historialAutomata.length - 1) {
              await fetch(`/simulaciones/${nuevaSimulacionId}/generaciones`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(historial)
              })
                .then(response => {
                  if (response.redirected) {
                    alert("Inicio de sesion requerido");
                    window.location.href = response.url;
                  }
                  return response.json();
                })
                .then(data => {
                  console.log(data);
                  error = data.error;
                  if (error) {
                    generaMensaje(data.error, "error");
                  }
                  return;
                })
                .catch(err => {
                  console.error(err);
                  error = err;
                  generaMensaje("Error al guardar el historial", "error");
                  return;
                });
              if (error) {
                return;
              }
              historial = [];
            }
          }
          if (error) {
            return;
          }
          alert("Simulación guardada correctamente");
          window.location.href = "/simulaciones";
        });
        botonProcesarAutomata?.addEventListener('click', async () => {
          // popup para guardar el nombre de la simulacion a procesar
          const nombreProcesamiento = prompt("Ingresa el nombre de la simulación a procesar");
          const descripcionProcesamiento = prompt("Ingresa una descripción para simulación a procesar"); // Opcional
          const numGeneraciones = parseInt(prompt("Ingresa el numero de generaciones a procesar"));
          if (nombreProcesamiento === null || nombreProcesamiento === "") {
            generaMensaje("Agrega un nombre a tu simulación", "advertencia");
            return;
          }
          // Paso 1: Crea la simulación
          const indice = parseInt(rangoHistorialAutomata.value);
          const simulacion = {
            nombre: nombreProcesamiento,
            descripcion: descripcionProcesamiento,
            altura: conf.altura,
            anchura: conf.anchura,
            estados: conf.numEstados,
            reglas: reglas,
            numGeneraciones: numGeneraciones,
            generacionInicial: historialAutomata[indice],
          };
          // console.log(simulacion);
          let msgError = validaProcesamiento(simulacion);
          if (msgError) {
            generaMensaje(msgError, "error");
            return;
          }
          let nuevaSimulacionId = null;
          let error = null;
          await fetch('/simulaciones/procesamiento', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(simulacion)
          })
            .then(response => {
              if (!response.redirected) {
                return response.json();
              }
              alert("Inicio de sesion requerido")
              window.location.href = response.url;
            })
            .then(data => {
              console.log(data);
              nuevaSimulacionId = data.simulacion_id
              error = data.error;
            })
            .catch(err => {
              console.error(err);
              error = err.message;
            });
          if (nuevaSimulacionId) {
            alert("Simulación guardada correctamente");
            window.location.href = "/simulaciones";
          }
          if (error) {
            generaMensaje(error, "error");
          }
        });
        botonGrafica1?.addEventListener('click', () => {
          if(grafica1) {
            grafica1.destroy(); // Destruye la gráfica anterior
          }
          grafica1 = inicializaGrafica(ctxGrafica1, conf.numEstados, colorEstados);

          for(matrizCelulas of historialAutomata) {
            const celulasPorEstado = cuentaEstados(matrizCelulas);
            agregaDatosGrafica(grafica1, celulasPorEstado);
          }
          grafica1.update();
        });
      });
    } else {
      console.error('Invalid WebAssembly binary file');
      generaMensaje("Error cargando el archivo wasm", "error");
    }
  })
  .catch(err => {
    console.error(err);
    generaMensaje("Error cargando el archivo wasm", "error");
  });

//////////////////////////////////////////////
////////// Validación de datos //////////////
//////////////////////////////////////////////

const MAX_NOMBRE = 255;
const MIN_NOMBRE = 2;
const MAX_DESCRIPCION = 2048;
const MAX_ALTURA = 500;
const MIN_ALTURA = 3;
const MAX_ANCHURA = 500;
const MIN_ANCHURA = 3;
const MAX_ESTADOS = 255;
const MIN_ESTADOS = 2;
const MIN_REGLAS = 1;
const MAX_GENERACIONES = 500;
const MIN_GENERACIONES = 1;

/**
 * Valida los datos de una simulación
 * @param {{nombre: string, descripcion: string|null, altura: number,
 * anchura: number, estados: number,
 * reglas: {condition: string, state: number}[]}} simulacion 
 * @returns {string|null} mensaje de error o null si no hay error
 */
function validaSimulacion(simulacion) {
  let mensaje = null;
  if (!simulacion.nombre || simulacion.nombre.length > MAX_NOMBRE || simulacion.nombre.length < MIN_NOMBRE) {
    mensaje = 'El nombre de la simulación debe tener entre 2 y 255 caracteres';
  }
  else if (simulacion.descripcion && simulacion.descripcion.length > MAX_DESCRIPCION) {
    mensaje = 'La descripción de la simulación debe tener como máximo 2048 caracteres';
  }
  else if (simulacion.altura > MAX_ALTURA || simulacion.altura < MIN_ALTURA) {
    mensaje = 'La altura de la simulación debe estar entre 3 y 500';
  }
  else if (simulacion.anchura > MAX_ANCHURA || simulacion.anchura < MIN_ANCHURA) {
    mensaje = 'La anchura de la simulación debe estar entre 3 y 500';
  }
  else if (simulacion.estados > MAX_ESTADOS || simulacion.estados < MIN_ESTADOS) {
    mensaje = 'El número de estados debe estar entre 2 y 255';
  }
  else if (simulacion.reglas.length < MIN_REGLAS) {
    mensaje = 'La simulación debe tener al menos una regla';
  }
  else if (simulacion.reglas.some(regla => !regla.condition || regla.state == null)) {
    mensaje = 'Todas las reglas deben tener una condición y un estado';
  }
  else if (simulacion.reglas.some(regla => typeof regla.condition !== 'string' || typeof regla.state !== 'number')) {
    mensaje = 'Las condiciones deben ser cadenas de texto y los estados números';
  }
  return mensaje;
}

/**
 * Valida los datos de una matriz
 * @param {{nombre: string, descripcion: string|null, altura: number,
* anchura: number, estados: number,
* reglas: {condition: string, state: number}[]}} simulacion
* @param {number[][]} matriz
* @returns {string|null} mensaje de error o null si no hay error
*/
function validaMatriz(simulacion, matriz) {
  let mensaje = null;
  if (matriz.length !== simulacion.altura) {
    mensaje = 'La matriz no tiene la altura correcta';
  }
  else if (matriz.some(fila => fila.length !== simulacion.anchura)) {
    mensaje = 'La matriz no tiene la anchura correcta';
  }
  else if (matriz.some(fila => fila.some(celda => celda < 0 || celda >= simulacion.estados))) {
    mensaje = 'La matriz contiene estados no válidos';
  }
  return mensaje;
}

/**
 * Valida los datos de una simulación para procesarla
 * @param {{nombre: string, descripcion: string|null, altura: number,
* anchura: number, estados: number,
* reglas: {condition: string, state: number}[],
* numGeneraciones: number, generacionInicial: number[][]}} simulacion 
* @returns {string|null} mensaje de error o null si no hay error
*/
function validaProcesamiento(simulacion) {
  let mensaje = null;
  mensaje = validaSimulacion(simulacion);
  if (mensaje) {
    return mensaje;
  }
  mensaje = validaMatriz(simulacion, simulacion.generacionInicial);
  if (mensaje) {
    return mensaje;
  }
  if (simulacion.numGeneraciones > MAX_GENERACIONES || simulacion.numGeneraciones < MIN_GENERACIONES) {
    mensaje = 'El número de generaciones debe estar entre 1 y 500';
  }
  return mensaje;
}