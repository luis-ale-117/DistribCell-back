"""
usuarios.py
Modulo para el manejo de los datos del usuario
"""
from flask import render_template, redirect, session, url_for, flash, Blueprint
from models import Usuarios

blueprint = Blueprint("usuarios", __name__)


@blueprint.route("/mi_cuenta", methods=["GET"])
def pagina_datos_usuario():
    """ABC"""
    if "usuario_id" not in session:
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        flash("Por favor, inicia sesion.", "info")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    return render_template("gestion_cuenta.html", usuario=usuario)


@blueprint.route("/mi-cuenta", methods=["POST"])
def actualiza_datos_usuario():
    """ABC"""
    # email = session["email"]
    # user = db.session.query(User).filter(User.email == email)
    return "ok"
