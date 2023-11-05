"""
simulaciones.py
Modulo para el manejo de las simulaciones pertenecientes del usuario
"""
from datetime import datetime
from flask import Blueprint, redirect, url_for, render_template, flash, session, request
from models import Simulaciones, Usuarios, Generaciones, Cola
from utils.db import db
from utils.validacion import (
    MAX_GENERACIONES,
    validar_campos_simulacion,
    validar_campos_procesamiento,
    validar_generacion,
)

blueprint = Blueprint("simulaciones", __name__)


@blueprint.route("/simulaciones", methods=["GET"])
def pagina_simulaciones():
    """Muestra las simulaciones del usuario"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    simulaciones = Simulaciones.query.filter_by(usuario_id=usuario.id).all()
    return render_template(
        "simulaciones.html", usuario=usuario, simulaciones=simulaciones
    )


@blueprint.route("/simulaciones/<int:simulacion_id>", methods=["GET"])
def pagina_simulacion(simulacion_id: int):
    """Muestra las simulaciones del usuario"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    simulacion = Simulaciones.query.filter_by(
        usuario_id=usuario.id, id=simulacion_id
    ).first_or_404()

    if simulacion.tipo == "PROCESAMIENTO":
        flash("La simulacion sigue en procesamiento", "info")
        return redirect(url_for("simulaciones.pagina_simulaciones"))

    if simulacion.tipo == "ERROR":
        flash("La simulacion no se pudo procesar. Revisa tus reglas.", "error")
    return render_template("simulacion.html", usuario=usuario, simulacion=simulacion)


@blueprint.route("/simulaciones/<int:simulacion_id>/borrar", methods=["GET"])
def borrar_simulacion(simulacion_id: int):
    """Borra la simulacion seleccionada"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    simulacion = Simulaciones.query.filter_by(
        usuario_id=usuario.id, id=simulacion_id
    ).first_or_404()
    cola = Cola.query.filter_by(simulacion_id=simulacion.id).first()

    for generacion in simulacion.generaciones:
        db.session.delete(generacion)
    if cola is not None:
        db.session.delete(cola)
    db.session.delete(simulacion)

    db.session.commit()
    flash("Simulacion borrada con exito", "exito")
    return redirect(url_for("simulaciones.pagina_simulaciones"))


@blueprint.route("/simulaciones", methods=["POST"])
def crear_simulacion():
    """Crea una nueva simulacion"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    conf = request.get_json()
    try:
        nombre = conf["nombre"]
        descripcion = conf["descripcion"]
        anchura = conf["anchura"]
        altura = conf["altura"]
        estados = conf["estados"]
        reglas = conf["reglas"]
    except KeyError:
        flash("Error en la peticion. Revisa los campos.", "advertencia")
        return redirect(url_for("simulaciones.pagina_simulaciones"))

    mensaje_validacion = validar_campos_simulacion(
        nombre, descripcion, anchura, altura, estados, reglas
    )
    if mensaje_validacion is not None:
        return {"error": mensaje_validacion}, 400

    if usuario.numero_simulaciones() >= 5:
        return {"error": "Limite de simulaciones alcanzado: 5"}, 400

    simulacion = Simulaciones(
        usuario_id=usuario.id,
        nombre=nombre,
        descripcion=descripcion,
        anchura=anchura,
        altura=altura,
        estados=estados,
        reglas=reglas,
        tipo="GUARDADO",
    )
    db.session.add(simulacion)
    db.session.commit()
    return {"status": "created", "simulacion_id": simulacion.id}, 201


@blueprint.route("/simulaciones/<int:simulacion_id>/generaciones", methods=["POST"])
def anadir_generaciones(simulacion_id: int):
    """Añade un bloque de generaciones a la simulacion"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    nuevas_generaciones: list[list[list[int]]] = request.get_json()
    simulacion: Simulaciones = Simulaciones.query.filter_by(
        usuario_id=usuario.id, id=simulacion_id
    ).first_or_404()
    indice: int = simulacion.numero_generaciones()

    if indice >= MAX_GENERACIONES:
        return {"error": "Limite de generaciones alcanzado"}, 400

    for generacion in nuevas_generaciones:
        mensaje = validar_generacion(
            simulacion.anchura, simulacion.altura, simulacion.estados, generacion
        )
        if mensaje is not None:
            return {"error": mensaje}, 400

    gens: list[Generaciones] = []
    for generacion in nuevas_generaciones:
        contenido = bytearray()
        for fila in generacion:
            contenido.extend(fila)
        contenido = bytes(contenido)
        gens.append(
            Generaciones(
                simulacion_id=simulacion.id,
                iteracion=indice,
                contenido=contenido,
            )
        )
        indice += 1
        if indice >= MAX_GENERACIONES:
            break

    db.session.add_all(gens)
    db.session.commit()
    return {"status": "created"}, 201


@blueprint.route("/simulaciones/<int:simulacion_id>/generaciones", methods=["GET"])
def obtener_generaciones(simulacion_id: int):
    """Añade un bloque de generaciones a la simulacion"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    simulacion: Simulaciones = Simulaciones.query.filter_by(
        usuario_id=usuario.id, id=simulacion_id
    ).first_or_404()

    gen_inicio = request.args.get("inicio", default=0, type=int)
    gen_fin = request.args.get("fin", default=10, type=int)

    generaciones: Generaciones = simulacion.generaciones

    if generaciones is None:
        return {"mensaje": "Simulacion sin generaciones"}, 200

    generaciones = generaciones[gen_inicio:gen_fin]

    matrices: list[list[list[int]]] = []
    filas: int = simulacion.altura
    columnas: int = simulacion.anchura

    for generacion in generaciones:
        matriz: list[list[int]] = []
        for fila in range(filas):
            matriz_fila: list[int] = []
            for columna in range(columnas):
                num = generacion.contenido[fila * columnas + columna]
                matriz_fila.append(num)
            matriz.append(matriz_fila)
        matrices.append(matriz)

    return matrices, 200


@blueprint.route("/simulaciones/procesamiento", methods=["POST"])
def crear_procesamiento():
    """Crea una nueva simulacion para procesar"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    conf = request.get_json()
    try:
        nombre = conf["nombre"]
        descripcion = conf["descripcion"]
        anchura = conf["anchura"]
        altura = conf["altura"]
        estados = conf["estados"]
        reglas = conf["reglas"]
        num_generaciones: int = conf["numGeneraciones"]
        generacion_inicial: list[list[int]] = conf["generacionInicial"]
    except KeyError:
        return {"error": "Error en la peticion. Revisa los campos."}, 400

    mensaje_validacion = validar_campos_procesamiento(
        nombre, descripcion, anchura, altura, estados, reglas, num_generaciones
    )
    if mensaje_validacion is not None:
        return {"error": mensaje_validacion}, 400
    if generacion_inicial is None:
        return {"error": "Simulacion sin generaciones"}, 400
    mensaje = validar_generacion(anchura, altura, estados, generacion_inicial)
    if mensaje is not None:
        return {"error": mensaje}, 400

    simulacion = Simulaciones(
        usuario_id=usuario.id,
        nombre=nombre,
        descripcion=descripcion,
        anchura=anchura,
        altura=altura,
        estados=estados,
        reglas=reglas,
        tipo="PROCESAMIENTO",
    )
    db.session.add(simulacion)
    db.session.commit()

    contenido = bytearray()
    for fila in generacion_inicial:
        contenido.extend(fila)
    contenido = bytes(contenido)
    generacion = Generaciones(
        simulacion_id=simulacion.id,
        iteracion=0,
        contenido=contenido,
    )

    db.session.add(generacion)
    db.session.commit()

    cola = Cola(
        simulacion_id=simulacion.id,
        ultima_actualizacion=int(datetime.now().timestamp()),
        num_generaciones=num_generaciones,
    )
    db.session.add(cola)
    db.session.commit()

    return {"status": "created", "simulacion_id": simulacion.id}, 201
