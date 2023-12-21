// @ts-nocheck
/** @type {HTMLHeadingElement} */
const simNombre = document.getElementById('simNombre');
/** @type {HTMLTableElement} */
const tabColorEstados = document.getElementById('tabColorEstados');
/** @type {HTMLInputElement} */
const rangoHistorialAutomata = document.getElementById('rangoHistorialAutomata');
/** @type {HTMLHeadingElement} */
const labelRangoHistorialAutomata = document.getElementById('labelRangoHistorialAutomata');
/** @type {HTMLInputElement} */
const numEstados = document.getElementById('numEstados');
/** @type {HTMLCanvasElement} */
const canvasGrid = document.getElementById('canvasGrid');
/** @type {CanvasRenderingContext2D} */
const ctx = canvasGrid?.getContext('2d');

/** @type {HTMLInputElement} */
const inputAnchura = document.getElementById('anchura');
/** @type {HTMLInputElement} */
const inputAltura = document.getElementById('altura');

const conf = {
  numEstados: parseInt(numEstados.value),
  anchura: parseInt(inputAnchura.value),
  altura: parseInt(inputAltura.value)
};
const divMensajes = document.getElementById('mensajes');
const divCanvas = document.getElementById('divCanvas');
divCanvas.style.display = 'none';
const divRuedaCarga = document.getElementById('divRuedaCarga');

const divGrafica1 = document.getElementById('divGrafica1');
const divGrafica2 = document.getElementById('divGrafica2');
const divGrafica3 = document.getElementById('divGrafica3');

const botonGraficas = document.getElementById('botonGraficas');
const inputRangoMedia = document.getElementById('inputRangoMedia');

/**
 * @type {HTMLCanvasElement}
 */
const canvasGrafica1 = document.getElementById('canvasGrafica1');
const ctxGrafica1 = canvasGrafica1.getContext('2d');
/**
 * @type {HTMLCanvasElement}
 */
const canvasGrafica2 = document.getElementById('canvasGrafica2');
const ctxGrafica2 = canvasGrafica2.getContext('2d');
/**
 * @type {HTMLCanvasElement}
 */
const canvasGrafica3 = document.getElementById('canvasGrafica3');
const ctxGrafica3 = canvasGrafica3.getContext('2d');
/**
 * @type {Chart} grafica1 - Gráfica de densidad de población
 */
let grafica1;
/**
 * @type {Chart} grafica2 - Gráfica de densidad de población media (en 10 generaciones)
 */
let grafica2;
/**
 * @type {Chart} grafica3 - Gráfica de varianza (en 10 generaciones)
 */
let grafica3;

const plugin = {
  // plugin para poner un fondo gris en la gráfica
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

const altura = parseInt(inputAltura?.value ?? '0');
const anchura = parseInt(inputAnchura?.value ?? '0');

/**
 * Genera un mensaje en la interfaz
 * @param {string} mensaje
 * @param {string} tipo error, info, advertencia, exito
 */
function generaMensaje(mensaje, tipo = 'error') {
  if (!divMensajes) return;
  const divMensaje = document.createElement('div');
  divMensaje.classList.add('alerta');
  divMensaje.classList.add(tipo);
  divMensaje.textContent = mensaje;

  const botonCerrar = document.createElement('button');
  botonCerrar.classList.add('cerrar-mensaje');
  botonCerrar.textContent = 'Cerrar';
  botonCerrar.addEventListener('click', (_) => {
    botonCerrar.parentElement?.classList.add('invisible');
  });

  divMensaje.appendChild(botonCerrar);
  divMensajes.appendChild(divMensaje);
}

const TAM_CELDA = 10; // Tamaño de la celda en píxeles
const SIM_ID = simNombre.dataset.id;

let ejecutando = false;
let colorEstados = ['#000000', '#ffffff'];
/** @type {number[][][]} */
let historialAutomata = [];
/** @type {number[][]} */
let matrizCelulas = [];

/**
 * Dibuja una matriz en el canvas
 * @param {number[][] | null | undefined} matrizCelulas
 * @param {string[]} colorEstados
 */
const dibujaMatrizInterfaz = (matrizCelulas, colorEstados) => {
  if (canvasGrid === null || ctx === null) return;
  if (!matrizCelulas) return;
  if (matrizCelulas.length === 0) return;

  ctx.clearRect(0, 0, canvasGrid.width, canvasGrid.height);
  for (let fila = 0; fila < matrizCelulas.length; fila++) {
    for (let columna = 0; columna < matrizCelulas[0].length; columna++) {
      ctx.fillStyle = colorEstados[matrizCelulas[fila][columna]];
      ctx.fillRect(columna * TAM_CELDA, fila * TAM_CELDA, TAM_CELDA, TAM_CELDA);
    }
  }
};

/**
 * Carga la tabla de colores en la interfaz
 * @param {string[]} colorEstados
 */
const cargarColorEstadosInterfaz = (colorEstados) => {
  if (tabColorEstados === null) return;

  while (tabColorEstados.firstChild) {
    tabColorEstados.removeChild(tabColorEstados.firstChild);
  }

  const filaEtiquetaEstados = document.createElement('tr');
  const filaColorEstados = document.createElement('tr');

  for (let i = 0; i < colorEstados.length; i++) {
    const estado = document.createElement('td');
    estado.textContent = i.toString();
    estado.dataset.estado = i.toString();

    const colorPicker = document.createElement('input');
    colorPicker.id = 'colorPicker-' + i.toString();
    colorPicker.setAttribute('type', 'color');
    colorPicker.value = colorEstados[i];
    colorPicker.dataset.estado = i.toString();
    colorPicker.addEventListener('change', () => {
      const estado = parseInt(colorPicker.dataset.estado ?? '0');
      colorEstados[estado] = colorPicker.value;
      dibujaMatrizInterfaz(matrizCelulas, colorEstados);
    });

    const color = document.createElement('td');
    color.appendChild(colorPicker);
    filaEtiquetaEstados.appendChild(estado);
    filaColorEstados.appendChild(color);
  }
  const fragment = document.createDocumentFragment();
  fragment.appendChild(filaEtiquetaEstados);
  fragment.appendChild(filaColorEstados);
  tabColorEstados.appendChild(fragment);
};

/**
 * Convierte hsl a hex
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {string}
 */
const hslToHex = (h, s, l) => {
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
    /**
     * Hue a RGB
     * @param {number} p
     * @param {number} q
     * @param {number} t
     * @returns {number}
     */
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
  /**
   * A hex
   * @param {number} c
   * @returns {string}
   */
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
};
/**
 * Asigna colores del arcoiris a cada estado de acuerdo al numero de estados
 * @param {number} numEstados
 * @param {number} saturation
 * @param {number} lightness
 */
const asignaColorArcoiris = (numEstados, saturation = 100, lightness = 50) => {
  const hueIncrement = 360 / numEstados;
  let hue = 0;
  colorEstados = [];
  for (let i = 0; i < numEstados; i++) {
    const color = hslToHex(hue, saturation, lightness);
    colorEstados.push(color);
    hue += hueIncrement;
  }
};

rangoHistorialAutomata?.addEventListener('input', (e) => {
  const indice = parseInt(e.target?.value);
  matrizCelulas = historialAutomata[indice];
  if (matrizCelulas === undefined) {
    generaMensaje('No hay un historial para esa generación', 'advertencia');
    return;
  }
  labelRangoHistorialAutomata.textContent = `Generación ${indice} de ${historialAutomata.length - 1} `;
  dibujaMatrizInterfaz(matrizCelulas, colorEstados);
});

const cargaSimulacionInterfaz = async () => {
  try {
    const response = await fetch(`/simulaciones/${SIM_ID}/generaciones`);
    if (response.redirected) {
      alert('Inicio de sesión requerido');
      window.location.href = response.url;
    }
    if (response.status !== 200) {
      generaMensaje('Ocurrió un error al cargar la simulación', 'error');
      return;
    }

    const generacionesComprimidasBuff = await response.arrayBuffer();
    const generacionesComprimidas = new Int8Array(generacionesComprimidasBuff);
    // Cada byte representa un estado.
    const generaciones = pako.inflate(generacionesComprimidas.buffer);
    const numGeneraciones = generaciones.length / (altura * anchura);

    historialAutomata = new Array(numGeneraciones)
      .fill(0)
      .map((_) => new Array(altura).fill(0).map((_) => new Array(anchura).fill(0)));

    for (let i = 0; i < numGeneraciones; i++) {
      for (let j = 0; j < altura; j++) {
        for (let k = 0; k < anchura; k++) {
          historialAutomata[i][j][k] = generaciones[i * altura * anchura + j * anchura + k];
        }
      }
    }
  } catch (error) {
    console.error(error);
    generaMensaje('Ocurrió un error guardando el historial', 'error');
    return;
  }
  divRuedaCarga.style.display = 'none';
  divCanvas.style.display = 'grid';
  rangoHistorialAutomata.max = (historialAutomata.length - 1).toString();
  rangoHistorialAutomata.value = '0';
  labelRangoHistorialAutomata.textContent = `Generación 0 de ${historialAutomata.length - 1} `;
  dibujaMatrizInterfaz(historialAutomata[0], colorEstados);
  matrizCelulas = historialAutomata[0];
};

/*
 * Cuenta el número de células por estado en una matriz de células
 * @param {number[][]} matrizCelulas
 * @returns {number[]} arreglo con el número de células por estado
 */
function cuentaEstadosDensidad(matrizCelulas) {
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
 * Calcula la densidad de población de cada estado en cada generación
 * @returns {number[][]} densidad de población de cada estado en cada generación
 */
function calculaDensidad() {
  /**
   * @type {number[][]}
   */
  const densidadPoblacion = new Array(conf.numEstados).fill(0).map((_) => new Array(historialAutomata.length));
  for (let i = 0; i < historialAutomata.length; i++) {
    const celulasPorEstado = cuentaEstadosDensidad(historialAutomata[i]);
    for (let estado = 0; estado < conf.numEstados; estado++) {
      densidadPoblacion[estado][i] = celulasPorEstado[estado];
    }
  }
  return densidadPoblacion;
}
/**
 * Calcula la densidad de población de cada estado en cada generación
 * @param {number} rangoMedia - Número de generaciones a promediar
 * @param {number[][]} densidadPoblacion - Densidad de población de cada estado en cada generación
 * @returns {number[][]} densidad media de población de cada estado en un intervalo de n generaciones
 */
function calculaDensidadMedia(rangoMedia, densidadPoblacion) {
  /**
   * @type {number[][]}
   */
  const densidadPoblacionMedia = new Array(densidadPoblacion.length)
    .fill(0)
    .map((_) => new Array(Math.ceil(densidadPoblacion[0].length / rangoMedia)));
  for (let estado = 0; estado < densidadPoblacion.length; estado++) {
    for (let rangoGeneracion = 0; rangoGeneracion < densidadPoblacionMedia[estado].length; rangoGeneracion++) {
      let suma = 0;
      const nGen = Math.min(rangoMedia, densidadPoblacion[estado].length - rangoGeneracion * rangoMedia);
      for (let i = 0; i < nGen; i++) {
        suma += densidadPoblacion[estado][rangoGeneracion * rangoMedia + i];
      }
      densidadPoblacionMedia[estado][rangoGeneracion] = suma / nGen;
    }
  }
  return densidadPoblacionMedia;
}
/**
 * Calcula la densidad de población de cada estado en cada generación
 * @param {number} rangoMedia - Número de generaciones a promediar
 * @param {number[][]} densidadPoblacion - Densidad de población de cada estado en cada generación
 * @param {number[][]} densidadPoblacionMedia - Densidad de población
 * @returns {number[][]} varianza de la poblacion en el intervalo de n generaciones
 */
function calculaVarianza(rangoMedia, densidadPoblacion, densidadPoblacionMedia) {
  /**
   * @type {number[][]}
   */
  const densidadPoblacionVarianza = new Array(densidadPoblacionMedia.length)
    .fill(0)
    .map((_) => new Array(densidadPoblacionMedia[0].length));
  for (let estado = 0; estado < densidadPoblacion.length; estado++) {
    for (let rangoGeneracion = 0; rangoGeneracion < densidadPoblacionMedia[estado].length; rangoGeneracion++) {
      let suma = 0;
      const media = densidadPoblacionMedia[estado][rangoGeneracion];
      const nGen = Math.min(rangoMedia, densidadPoblacion[estado].length - rangoGeneracion * rangoMedia);
      for (let i = 0; i < nGen; i++) {
        const xi = densidadPoblacion[estado][rangoGeneracion * rangoMedia + i];
        suma += (xi - media) * (xi - media); // (xi - media)^2
      }
      densidadPoblacionVarianza[estado][rangoGeneracion] = suma / nGen;
    }
  }
  return densidadPoblacionVarianza;
}
/**
 * Inicializa la gráfica con el número de células por estado
 * @param {HTMLCanvasElement} ctxGrafica - Gráfica
 * @param {number} numEstados - Número de estados
 * @param {string[]} colorEstados - Arreglo con los colores de cada estado
 * @returns {Chart} Gráfica inicializada
 */
function inicializaGrafica(ctxGrafica, numEstados, colorEstados) {
  const labels = [];
  const datasets = [];
  for (let i = 0; i < numEstados; i++) {
    datasets.push({
      label: i.toString(),
      data: new Array(0),
      fill: false,
      borderColor: colorEstados[i],
      tension: 0.1
    });
  }
  return new Chart(ctxGrafica, {
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
          color: 'lightGrey'
        }
      }
    },
    plugins: [plugin]
  });
}
/**
 * Actualiza la gráfica con el número de células por estado
 * @param {Chart} grafica - Gráfica
 * @param {number[][]} densidadPoblacion - Densidad de población de cada estado en cada generación
 */
function agregaDatosGraficaDensidad(grafica, densidadPoblacion) {
  for (estado = 0; estado < densidadPoblacion.length; estado++) {
    grafica.data.datasets[estado].data = densidadPoblacion[estado];
  }
  const numGeneraciones = densidadPoblacion[0].length;
  grafica.data.labels = new Array(numGeneraciones);
  for (let generacion = 0; generacion < numGeneraciones; generacion++) {
    grafica.data.labels[generacion] = generacion;
  }
}
/**
 * Actualiza la gráfica con el número de células por estado
 * @param {Chart} grafica - Gráfica
 * @param {number} rangoMedia - Número de generaciones a promediar
 * @param {number[][]} densidadPoblacionMedia - Densidad de población de cada estado en cada generación
 */
function agregaDatosGraficaDensidadMedia(grafica, rangoMedia, densidadPoblacionMedia) {
  for (estado = 0; estado < densidadPoblacionMedia.length; estado++) {
    grafica.data.datasets[estado].data = densidadPoblacionMedia[estado];
  }
  const numGeneraciones = historialAutomata.length;
  const numRangos = densidadPoblacionMedia[0].length;
  grafica.data.labels = new Array(numRangos);
  for (let rangoGeneracion = 0; rangoGeneracion < numRangos; rangoGeneracion++) {
    const genMin = rangoGeneracion * rangoMedia;
    const genMax = Math.min(numGeneraciones, (rangoGeneracion + 1) * rangoMedia) - 1;
    grafica.data.labels[rangoGeneracion] = `${genMin}-${genMax}`;
  }
}
/**
 * Actualiza la gráfica con el número de células por estado
 * @param {Chart} grafica - Gráfica
 * @param {number} rangoMedia - Número de generaciones a promediar
 * @param {number[][]} varianzaPoblacion - Densidad de población de cada estado en cada generación
 */
function agregaDatosGraficaVarianza(grafica, rangoMedia, varianzaPoblacion) {
  agregaDatosGraficaDensidadMedia(grafica, rangoMedia, varianzaPoblacion);
}

botonGraficas?.addEventListener('click', () => {
  divGrafica1.style.display = 'grid';
  divGrafica2.style.display = 'grid';
  divGrafica3.style.display = 'grid';
  if (grafica1) {
    grafica1.destroy();
  }
  if (grafica2) {
    grafica2.destroy();
  }
  if (grafica3) {
    grafica3.destroy();
  }

  const r = parseInt(inputRangoMedia.value);
  if (Number.isNaN(r) || r < 1) {
    inputRangoMedia.value = '1';
  }
  const rangoMedia = parseInt(inputRangoMedia.value);

  const g2Titulo = divGrafica2.children[0];
  const g3Titulo = divGrafica3.children[0];
  g2Titulo.textContent = `Gráfica de densidad media (${rangoMedia} generaciones)`;
  g3Titulo.textContent = `Gráfica de varianza (${rangoMedia} generaciones)`;

  grafica1 = inicializaGrafica(ctxGrafica1, conf.numEstados, colorEstados);
  grafica2 = inicializaGrafica(ctxGrafica2, conf.numEstados, colorEstados);
  grafica3 = inicializaGrafica(ctxGrafica3, conf.numEstados, colorEstados);

  const densidadPoblacion = calculaDensidad();
  const densidadPoblacionMedia = calculaDensidadMedia(rangoMedia, densidadPoblacion);
  const varianzaPoblacion = calculaVarianza(rangoMedia, densidadPoblacion, densidadPoblacionMedia);
  agregaDatosGraficaDensidad(grafica1, densidadPoblacion);
  agregaDatosGraficaDensidadMedia(grafica2, rangoMedia, densidadPoblacionMedia);
  agregaDatosGraficaVarianza(grafica3, rangoMedia, varianzaPoblacion);
  grafica1.update();
  grafica2.update();
  grafica3.update();
});

asignaColorArcoiris(parseInt(numEstados.value));
cargarColorEstadosInterfaz(colorEstados);

cargaSimulacionInterfaz();
