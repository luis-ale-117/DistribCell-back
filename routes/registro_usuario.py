"""
registro_usuario.py
Modulo para el registro de nuevos usuarios
"""
from flask import (
    render_template,
    request,
    session,
    redirect,
    url_for,
    flash,
    Blueprint,
)
from models.usuarios import Usuarios
from utils.db import db

blueprint = Blueprint("registro_usuario", __name__)


@blueprint.route("/registro_usuario", methods=["GET"])
def pagina_registro_usuario():
    """Regresa la pagina de registro de usuario"""
    if "usuario_id" in session:
        return redirect(url_for("pagina_inicio"))
    return render_template("registro_usuario.html")


@blueprint.route("/registro_usuario", methods=["POST"])
def crea_usuario():
    """Crea el usuario"""
    if "usuario_id" in session:
        return redirect(url_for("pagina_inicio"))
    nombre = request.form["name"]
    apellido = request.form["lastname"]
    correo = request.form["email"]
    contrasena = request.form["password"]

    # Validar campos
    # Flash error
    # return redirect(url_for("pagina_registro_usuario"))

    usuario = Usuarios.query.filter_by(correo=correo).first()
    if usuario:  # and usuario.confirmado
        flash("Correo no dispoible", "advertencia")
        return redirect(url_for("pagina_registro_usuario"))
    # Si el usuario esta sin confirmar, actualiza los campos
    # nombre, contrasena, etc
    else:
        usuario = Usuarios(nombre, apellido, correo, contrasena)
    db.session.add(usuario)
    db.session.commit()
    # Genera el token de confirmacion de correo electronico
    # Envia el token
    flash("Registrado. Te enviamos un correo de confirmacion.", "exito")
    return redirect(url_for("pagina_registro_usuario"))