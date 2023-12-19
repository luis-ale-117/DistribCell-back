"""
Validacion de datos
"""
import re


MIN_CONTRASENA = 8
MAX_CONTRASENA = 255
MAX_NOMBRE = 255
MAX_APELLIDO = 255
MAX_CORREO = 255
MAX_DESCRIPCION = 2048

MIN_ANCHURA = 1
MAX_ANCHURA = 500
MIN_ALTURA = 1
MAX_ALTURA = 500
MIN_ESTADOS = 2
MAX_ESTADOS = 255
MIN_REGLAS = 1

MAX_GENERACIONES = 500

email_regex = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b")


def validar_campos_nuevo_usuario(
    nombre: str, apellido: str, correo: str, contrasena: str, contrasena2: str
):
    """Validacion de los campos al registrar un usuario nuevo"""
    mensaje = None
    if not isinstance(nombre, str):
        mensaje = "Nombre debe ser una cadena"
    elif not isinstance(apellido, str):
        mensaje = "Apellido debe ser una cadena"
    elif not isinstance(correo, str):
        mensaje = "Correo debe ser una cadena"
    elif not isinstance(contrasena, str):
        mensaje = "Contraseña debe ser una cadena"
    elif not isinstance(contrasena2, str):
        mensaje = "Contraseña2 debe ser una cadena"

    elif nombre == "":
        mensaje = "Nombre requerido"
    elif not 1 <= len(nombre) <= MAX_NOMBRE:
        mensaje = "El nombre debe tener entre 1 y 255 caracteres"
    elif apellido == "":
        mensaje = "Apellido requerido"
    elif not 2 <= len(apellido) <= MAX_APELLIDO:
        mensaje = "El apellido debe tener entre 2 y 255 caracteres"
    elif correo == "":
        mensaje = "Correo requerido"
    elif not 2 <= len(correo) <= MAX_CORREO:
        mensaje = "El correo debe tener entre 2 y 255 caracteres"
    elif not email_regex.fullmatch(correo):
        mensaje = "El correo tiene un formato inválido"
    elif contrasena == "":
        mensaje = "Contraseña requerida"
    elif not MIN_CONTRASENA <= len(contrasena) <= MAX_CONTRASENA:
        mensaje = f"La contraseña debe tener entre {MIN_CONTRASENA} y {MAX_CONTRASENA} caracteres"
    elif contrasena != contrasena2:
        mensaje = "Las contraseñas no son iguales"
    return mensaje


def validar_campos_usuario(nombre: str, apellido: str, correo: str) -> str | None:
    """Validación de los campos al intentar actualizar los datos de un usuario"""
    mensaje = None
    if not isinstance(nombre, str):
        mensaje = "Nombre debe ser una cadena"
    elif not isinstance(apellido, str):
        mensaje = "Apellido debe ser una cadena"
    elif not isinstance(correo, str):
        mensaje = "Correo debe ser una cadena de texto"

    elif nombre == "":
        mensaje = "Nombre requerido"
    elif not 1 <= len(nombre) <= MAX_NOMBRE:
        mensaje = "El nombre debe tener entre 1 y 255 caracteres"
    elif apellido == "":
        mensaje = "Apellido requerido"
    elif not 2 <= len(apellido) <= MAX_APELLIDO:
        mensaje = "El apellido debe tener entre 2 y 255 caracteres"
    elif correo != "":
        mensaje = "No esta permitido cambiar el correo"
    return mensaje


def validar_campos_simulacion(
    nombre: str,
    descripcion: str | None,
    anchura: int,
    altura: int,
    estados: int,
    reglas: list[dict[str, str | int]],
) -> str | None:
    """Validación de los campos al intentar crear una simulación"""
    mensaje = None
    if not isinstance(nombre, str):
        mensaje = "Nombre debe ser una cadena"
    elif not isinstance(descripcion, (str, type(None))):
        mensaje = "Descripción debe ser una cadena o None"
    elif not isinstance(anchura, int):
        mensaje = "Anchura debe ser un entero"
    elif not isinstance(altura, int):
        mensaje = "Altura debe ser un entero"
    elif not isinstance(estados, int):
        mensaje = "Estados debe ser un entero"
    elif not isinstance(reglas, list):
        mensaje = "Reglas debe ser una lista"

    elif nombre == "":
        mensaje = "Nombre requerido"
    elif not 1 <= len(nombre) <= MAX_NOMBRE:
        mensaje = "El nombre debe tener entre 1 y 255 caracteres"
    elif descripcion not in [None, ""] and not 1 <= len(descripcion) <= MAX_DESCRIPCION:
        mensaje = "La descripción debe tener entre 0 y 2048 caracteres"
    elif not MIN_ANCHURA <= anchura <= MAX_ANCHURA:
        mensaje = f"Anchura debe estar entre {MIN_ANCHURA} y {MAX_ANCHURA}"
    elif not MIN_ALTURA <= altura <= MAX_ALTURA:
        mensaje = f"Altura debe estar entre {MIN_ALTURA} y {MAX_ALTURA}"
    elif not MIN_ESTADOS <= estados <= MAX_ESTADOS:
        mensaje = f"Estados debe estar entre {MIN_ESTADOS} y {MAX_ESTADOS}"
    elif not MIN_REGLAS <= len(reglas):
        mensaje = f"Debe haber al menos {MIN_REGLAS} regla"
    for regla in reglas:
        if not isinstance(regla, dict):
            mensaje = "Cada regla debe ser un objeto valido"
        elif "condition" not in regla:
            mensaje = "Cada regla debe tener una condición"
        elif "state" not in regla:
            mensaje = "Cada regla debe tener un estado"
        elif not isinstance(regla["state"], int):
            mensaje = "El estado de cada regla debe ser un entero"
        elif not isinstance(regla["condition"], str):
            mensaje = "La condición de cada regla debe ser una cadena"
        elif MIN_ESTADOS <= regla["state"] <= MAX_ESTADOS:
            mensaje = f"El estado de cada regla debe estar entre {MIN_ESTADOS} y {MAX_ESTADOS}"
        if mensaje is not None:
            break

    return mensaje


def validar_campos_procesamiento(
    nombre: str,
    descripcion: str | None,
    anchura: int,
    altura: int,
    estados: int,
    reglas: list[dict[str, str | int]],
    num_generaciones: int,
) -> str | None:
    """Validación de los campos al intentar crear una simulación para procesamiento"""
    mensaje = None
    mensaje = validar_campos_simulacion(
        nombre, descripcion, anchura, altura, estados, reglas
    )
    if mensaje is not None:
        return mensaje
    if not isinstance(num_generaciones, int):
        mensaje = "El numero de generaciones debe ser un entero"
    elif not 1 <= num_generaciones <= MAX_GENERACIONES:
        mensaje = f"El numero de generaciones debe estar entre 1 y {MAX_GENERACIONES}"
    return mensaje


def validar_generacion(
    anchura: int,
    altura: int,
    estados: int,
    generacion: bytes,
):
    """Validación de la generación"""
    mensaje = None
    if len(generacion) != (altura * anchura):
        mensaje = "Altura y anchura no coinciden con la configuración de la simulación"
    for casilla in generacion:
        if not 0 <= casilla <= estados:
            mensaje = f"Cada casilla de la generación debe estar entre 0 y {estados}"
        if mensaje is not None:
            break
    return mensaje


def validar_generacion_matriz(
    anchura: int,
    altura: int,
    estados: int,
    generacion: list[list[int]],
):
    """Validación de la generacion"""
    mensaje = None
    if not isinstance(generacion, list):
        mensaje = "La generacion debe ser una lista de listas de enteros"
    elif len(generacion) != altura:
        mensaje = f"La altura de la generacion debe ser {altura} casillas"
    for fila in generacion:
        if not isinstance(fila, list):
            mensaje = "Cada fila de la generacion debe ser una lista de enteros"
        elif len(fila) != anchura:
            mensaje = f"Cada fila de la generacion debe tener {anchura} casillas"
        for casilla in fila:
            if not isinstance(casilla, int):
                mensaje = "Cada casilla de la generacion debe ser un entero"
            elif not 0 <= casilla <= estados:
                mensaje = (
                    f"Cada casilla de la generacion debe estar entre 0 y {estados}"
                )
        if mensaje is not None:
            break
    return mensaje
