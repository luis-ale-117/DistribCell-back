"""
simulaciones.py
Modulo para el manejo de las simulaciones pertenecientes del usuario
"""
from flask import Blueprint, redirect, url_for, render_template, flash, session, request
from models import Simulaciones, Usuarios, Generaciones, Cola
from utils.db import db

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
    simulacion = Simulaciones(
        usuario_id=usuario.id,
        nombre=conf["nombre"],
        descripcion=conf["descripcion"],
        anchura=conf["anchura"],
        altura=conf["altura"],
        estados=conf["estados"],
        reglas=conf["reglas"],
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
    nuevas_generaciones = request.get_json()
    simulacion: Simulaciones = Simulaciones.query.filter_by(
        usuario_id=usuario.id, id=simulacion_id
    ).first_or_404()
    indice: int = simulacion.numero_generaciones()

    for generacion in nuevas_generaciones:
        contenido = bytearray()
        for fila in generacion:
            contenido.extend(fila)
        contenido = bytes(contenido)
        db.session.add(
            Generaciones(
                simulacion_id=simulacion.id,
                iteracion=indice,
                contenido=contenido,
            )
        )
        indice += 1
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
    simulacion = Simulaciones(
        usuario_id=usuario.id,
        nombre=conf["nombre"],
        descripcion=conf["descripcion"],
        anchura=conf["anchura"],
        altura=conf["altura"],
        estados=conf["estados"],
        reglas=conf["reglas"],
        tipo="PROCESAMIENTO",
    )
    db.session.add(simulacion)
    db.session.commit()

    generacion_inicial: list[list[int]] = conf["generacionInicial"]
    if generacion_inicial is None:
        return {"mensaje": "Simulacion sin generaciones"}, 200

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
        estado="PENDIENTE",
    )
    db.session.add(cola)
    db.session.commit()

    return {"status": "created", "simulacion_id": simulacion.id}, 201
