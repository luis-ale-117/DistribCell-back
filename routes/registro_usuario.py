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
from models import Usuarios
from utils.db import db

blueprint = Blueprint("registro_usuario", __name__)


def validar_campos(
    nombre: str, apellido: str, correo: str, contrasena: str, contrasena2: str
) -> str | None:
    """Validacion de los campos al registrar un usuario"""
    if nombre == "":
        return "Nombre requerido"
    if apellido == "":
        return "Apellido requerido"
    if correo == "":
        return "Correo requerido"
    if contrasena == "":
        return "Contraseña requerida"
    if contrasena != contrasena2:
        return "Las contraseñas no son iguales"
    return None


@blueprint.route("/registro_usuario", methods=["GET"])
def pagina_registro_usuario():
    """Regresa la pagina de registro de usuario"""
    if "usuario_id" in session:
        return redirect(url_for("inicio.pagina_inicio"))
    return render_template("registro_usuario.html")


@blueprint.route("/registro_usuario", methods=["POST"])
def crea_usuario():
    """Crea el usuario"""
    if "usuario_id" in session:
        return redirect(url_for("inicio.pagina_inicio"))
    try:
        nombre = request.form["nombre"].strip()
        apellido = request.form["apellido"].strip()
        correo = request.form["correo"].strip()
        contrasena = request.form["contrasena"]
        contrasena2 = request.form["contrasena2"]
    except KeyError:
        flash("Error en la peticion. Revisa los campos.", "error")
        redirect(url_for("registro_usuario.pagina_registro_usuario"))

    # Validar campos
    mensaje_validacion = validar_campos(
        nombre, apellido, correo, contrasena, contrasena2
    )
    if mensaje_validacion is not None:
        flash(mensaje_validacion, "error")
        return redirect(url_for("registro_usuario.pagina_registro_usuario"))

    usuario = Usuarios.query.filter_by(correo=correo).first()
    if usuario:  # and usuario.confirmado
        flash("Correo no dispoible", "advertencia")
        return redirect(url_for("registro_usuario.pagina_registro_usuario"))
    # Si el usuario esta sin confirmar, actualiza los campos
    # nombre, contrasena, etc
    else:
        usuario = Usuarios(nombre, apellido, correo, contrasena)
    db.session.add(usuario)
    db.session.commit()
    # Genera el token de confirmacion de correo electronico
    # Envia el token
    flash("Registrado. Te enviamos un correo de confirmacion.", "exito")
    print(url_for("inicio.pagina_inicio"))
    return redirect(url_for("inicio.pagina_inicio"))
