"""
inicio_sesion.py
Modulo para el manejo de sesiones de usuarios
que ya estan registrados y confirmados
"""
from flask import (
    redirect,
    render_template,
    request,
    session,
    url_for,
    flash,
    Blueprint,
)
from models.usuarios import Usuarios

blueprint = Blueprint("sesion", __name__)


@blueprint.route("/inicio_sesion", methods=["GET"])
def pagina_inicio_de_sesion():
    """Regresa la pagina de inicio de sesion"""
    if "usuario_id" in session:
        return redirect(url_for("pagina_inicio"))
    return render_template("inicio_sesion.html")


@blueprint.route("/inicio_sesion", methods=["POST"])
def genera_sesion():
    """Genera la sesion del usuario"""
    if "usuario_id" in session:
        return redirect(url_for("pagina_inicio"))
    correo = request.form["email"]
    contrasena = request.form["password"]
    usuario = Usuarios.query.filter_by(correo=correo).first_or_404()
    if usuario is None or not usuario.checa_contrasena(contrasena):
        flash("Usuario o contrasena incorrecta, intenta de nuevo", "error")
        return redirect(url_for("pagina_inicio_de_sesion"))
    session.permanent = True
    session["usuario_id"] = usuario.id
    return redirect(url_for("pagina_inicio"))


@blueprint.route("/cierra_sesion", methods=["GET"])
def cierra_sesion():
    """Cierra la sesion del usuario"""
    if "usuario_id" not in session:
        return redirect(url_for("pagina_inicio_de_sesion"))
    session.pop("usuario_id", None)
    flash("Sesion finalizada", "exito")
    return redirect(url_for("pagina_inicio"))