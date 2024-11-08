"""
inicio_sesion.py
Modulo para el manejo de sesiones de usuarios
que ya están registrados y confirmados
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
from models import Usuarios

blueprint = Blueprint("sesion", __name__)


@blueprint.route("/inicio_sesion", methods=["GET"])
def pagina_inicio_de_sesion():
    """Regresa la pagina de inicio de sesión"""
    if "usuario_id" in session:
        return redirect(url_for("inicio.pagina_inicio"))
    return render_template("inicio_sesion.html", titulo="Inicia Sesión")


@blueprint.route("/inicio_sesion", methods=["POST"])
def genera_sesion():
    """Genera la sesion del usuario"""
    if "usuario_id" in session:
        return redirect(url_for("inicio.pagina_inicio"))
    try:
        correo = request.form["correo"]
        contrasena = request.form["contrasena"]
    except KeyError:
        flash("Error en la petición. Revisa los campos.", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    usuario = Usuarios.query.filter_by(correo=correo).first()
    if usuario is None or not usuario.checa_contrasena(contrasena):
        flash("Usuario o contraseña incorrecta, intenta de nuevo", "advertencia")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    if usuario and not usuario.confirmado:
        flash("Confirma tu cuenta. Revisa tu correo.", "advertencia")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    session.permanent = True
    session["usuario_id"] = usuario.id
    return redirect(url_for("inicio.pagina_inicio"))


@blueprint.route("/cierra_sesion", methods=["GET"])
def cierra_sesion():
    """Cierra la sesion del usuario"""
    if "usuario_id" not in session:
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    session.pop("usuario_id", None)
    flash("Sesión finalizada", "exito")
    return redirect(url_for("inicio.pagina_inicio"))
