"""
simulaciones.py
Modulo para el manejo de las simulaciones pertenecientes del usuario
"""
from flask import Blueprint, redirect, url_for, render_template, flash, session
from models import Simulaciones, Usuarios
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
