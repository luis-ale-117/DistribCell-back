"""
simulaciones.py
Modulo para el manejo de las simulaciones pertenecientes del usuario
"""
import zlib
from datetime import datetime
from flask import Blueprint, redirect, url_for, render_template, flash, session, request
from models import Simulaciones, Usuarios, Generaciones, Cola
from utils.db import db
from utils.validacion import (
    MAX_GENERACIONES,
    validar_campos_simulacion,
    validar_campos_procesamiento,
    validar_generacion,
    validar_generacion_matriz,
)

blueprint = Blueprint("simulaciones", __name__)


@blueprint.route("/simulaciones", methods=["GET"])
def pagina_simulaciones():
    """Muestra las simulaciones del usuario"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesión.", "info")
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    simulaciones = Simulaciones.query.filter_by(usuario_id=usuario.id).all()
    return render_template(
        "simulaciones.html",
        usuario=usuario,
        simulaciones=simulaciones,
        titulo="Simulaciones",
    )


@blueprint.route("/simulaciones/<int:simulacion_id>", methods=["GET"])
def pagina_simulacion(simulacion_id: int):
    """Muestra las simulaciones del usuario"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesión.", "info")
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    simulacion = Simulaciones.query.filter_by(
        usuario_id=usuario.id, id=simulacion_id
    ).first()

    if simulacion is None:
        flash("Simulación no encontrada", "error")
        return redirect(url_for("simulaciones.pagina_simulaciones"))

    if simulacion.tipo == "PROCESAMIENTO":
        flash("La simulacion sigue en procesamiento", "info")
        return redirect(url_for("simulaciones.pagina_simulaciones"))

    if simulacion.tipo == "ERROR":
        flash("La simulacion no se pudo procesar. Revisa tus reglas.", "error")
    if simulacion.tipo == "TIMEOUT":
        flash(
            "La simulacion tomó demasiado tiempo en procesarse. No se pudo completar.",
            "error",
        )
    return render_template(
        "simulacion.html",
        usuario=usuario,
        simulacion=simulacion,
        titulo="Simulación " + str(simulacion_id),
    )


@blueprint.route("/simulaciones/<int:simulacion_id>/borrar", methods=["GET"])
def borrar_simulacion(simulacion_id: int):
    """Borra la simulacion seleccionada"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesión.", "info")
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    simulacion = Simulaciones.query.filter_by(
        usuario_id=usuario.id, id=simulacion_id
    ).first()

    if simulacion is None:
        flash("Simulación no encontrada", "error")
        return redirect(url_for("simulaciones.pagina_simulaciones"))

    cola = Cola.query.filter_by(simulacion_id=simulacion.id).first()

    for generacion in simulacion.generaciones:
        db.session.delete(generacion)
    if cola is not None:
        db.session.delete(cola)
    db.session.delete(simulacion)

    db.session.commit()
    flash("Simulación borrada con éxito", "exito")
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
    if usuario.numero_simulaciones() >= 5:
        return {"error": "Limite de simulaciones alcanzado: 5"}, 400

    conf = request.get_json()
    try:
        nombre = conf["nombre"]
        descripcion = conf["descripcion"]
        anchura = conf["anchura"]
        altura = conf["altura"]
        estados = conf["estados"]
        reglas = conf["reglas"]
    except KeyError:
        flash("Error en la petición. Revisa los campos.", "advertencia")
        return redirect(url_for("simulaciones.pagina_simulaciones"))

    mensaje_validacion = validar_campos_simulacion(
        nombre, descripcion, anchura, altura, estados, reglas
    )
    if mensaje_validacion is not None:
        return {"error": mensaje_validacion}, 400

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

    simulacion: Simulaciones = Simulaciones.query.filter_by(
        usuario_id=usuario.id, id=simulacion_id
    ).first()

    if simulacion is None:
        flash("Simulación no encontrada", "error")
        return redirect(url_for("simulaciones.pagina_simulaciones"))

    generaciones_comprimidas = request.data
    generaciones_bytes = zlib.decompress(generaciones_comprimidas)

    items_por_generacion = int(simulacion.anchura * simulacion.altura)
    if len(generaciones_bytes) % items_por_generacion != 0:
        return {"error": "Error en el numero de elementos"}, 400

    num_generaciones = len(generaciones_bytes) // items_por_generacion
    indice: int = simulacion.numero_generaciones()

    if indice >= MAX_GENERACIONES or indice + num_generaciones > MAX_GENERACIONES:
        return {
            "error": f"Se supera el limite de generaciones: {MAX_GENERACIONES}"
        }, 400

    nuevas_generaciones = [
        generaciones_bytes[i * items_por_generacion : (i + 1) * items_por_generacion]
        for i in range(num_generaciones)
    ]

    for generacion in nuevas_generaciones:
        mensaje = validar_generacion(
            simulacion.anchura, simulacion.altura, simulacion.estados, generacion
        )
        if mensaje is not None:
            return {"error": mensaje}, 400

    gens: list[Generaciones] = [
        Generaciones(
            simulacion_id=simulacion.id,
            iteracion=indice + i,
            contenido=generacion,
        )
        for i, generacion in enumerate(nuevas_generaciones)
    ]

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
    ).first()

    if simulacion is None:
        flash("Simulación no encontrada", "error")
        return redirect(url_for("simulaciones.pagina_simulaciones"))

    generaciones: Generaciones = simulacion.generaciones

    if generaciones is None:
        return {"error": "Simulación sin generaciones"}, 404

    matrices = bytearray()
    for generacion in generaciones:
        matrices.extend(generacion.contenido)

    matrices_comp = zlib.compress(matrices)

    return matrices_comp, 200


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
    if usuario.numero_simulaciones() >= 5:
        return {"error": "Limite de simulaciones alcanzado: 5"}, 400

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
        return {"error": "Error en la petición. Revisa los campos."}, 400

    mensaje_validacion = validar_campos_procesamiento(
        nombre, descripcion, anchura, altura, estados, reglas, num_generaciones
    )
    if mensaje_validacion is not None:
        return {"error": mensaje_validacion}, 400
    if generacion_inicial is None:
        return {"error": "Simulación sin generaciones"}, 400
    mensaje = validar_generacion_matriz(anchura, altura, estados, generacion_inicial)
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
