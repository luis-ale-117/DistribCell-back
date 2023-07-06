"""
    signup.py
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
from models.user import User
from utils.db import db

blueprint = Blueprint("registro", __name__)


@blueprint.route("/registro_usuario", methods=["GET"])
def pagina_registro_usuario():
    """Regresa la pagina de registro de usuario"""
    if "usuario_id" in session:
        return redirect(url_for("inicio"))
    return render_template("registro_usuario.html")


@blueprint.route("/registro_usuario", methods=["POST"])
def crea_usuario():
    """Crea el usuario"""
    if "usuario_id" in session:
        return redirect(url_for("inicio"))
    name = request.form["name"]
    lastname = request.form["lastname"]
    email = request.form["email"]
    password = request.form["password"]

    # Validar campos
    # Flash error
    # return redirect(url_for("pagina_registro_usuario"))

    usuario = User.query.filter_by(email=email).first()
    if usuario:  # and usuario.confirmado
        flash("Correo no dispoible", "advertencia")
        return redirect(url_for("pagina_registro_usuario"))
    # Si el usuario esta sin confirmar, actualiza los campos
    # nombre, contrasena, etc
    else:
        usuario = User(
            email=email,
            password=password,
            name=name,
            lastname=lastname,
        )
    db.session.add(usuario)
    db.session.commit()
    # Genera el token de confirmacion de correo electronico
    # Envia el token
    flash("Registrado. Te enviamos un correo de confirmacion.", "exito")
    return redirect(url_for("pagina_registro_usuario"))
