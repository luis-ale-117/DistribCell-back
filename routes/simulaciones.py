"""
simulaciones.py
Modulo para el manejo de las simulaciones pertenecientes del usuario
"""
from flask import Blueprint, redirect, url_for, render_template, flash, session
from models import Simulaciones

blueprint = Blueprint("simulaciones", __name__)


@blueprint.route("/mi_cuenta", methods=["GET"])
def pagina_datos_usuario():
    """ABC"""
    if "usuario_id" not in session:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Simulaciones.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    return render_template("gestion_cuenta.html", usuario=usuario)


@blueprint.route("/actualizar_proyecto", methods=["POST"])
def actualizar_proyecto():
    """ABC"""
    return "UPDATE"


@blueprint.route("/borrar_proyecto", methods=["POST"])
def borrar_proyecto():
    """ABC"""
    return "DELETE"
