"""
usuarios.py
Modulo para el manejo de los datos del usuario
"""
from flask import render_template, redirect, session, url_for, flash, request, Blueprint
from utils.db import db
from models import Usuarios

blueprint = Blueprint("usuarios", __name__)


def validar_campos(nombre: str, apellido: str, correo: str) -> str | None:
    """Validacion de los campos al registrar un usuario"""
    if nombre == "":
        return "Nombre requerido"
    if apellido == "":
        return "Apellido requerido"
    if correo != "":
        return "No se puede cambiar el correo"
    return None


@blueprint.route("/mi_cuenta", methods=["GET"])
def pagina_datos_usuario():
    """ABC"""
    if "usuario_id" not in session:
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    return render_template("gestion_cuenta.html", usuario=usuario)


@blueprint.route("/mi_cuenta", methods=["POST"])
def actualiza_datos_usuario():
    """Actualiza los datos del usuario"""
    if "usuario_id" not in session:
        return redirect(url_for("inicio.pagina_inicio"))
    usuario = Usuarios.query.get(session["usuario_id"])
    if usuario is None:  # and usuario.confirmado
        session.pop("usuario_id", None)
        flash("Cuenta no encontrada. Vuelve a iniciar sesión", "error")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))

    try:
        nombre: str = request.form["nombre"].strip()
        apellido: str = request.form["apellido"].strip()
        correo: str = request.form["correo"].strip()
        nueva_contrasena: str = request.form["nuevaContrasena"]
        nueva_contrasena2: str = request.form["nuevaContrasena2"]
        contrasena_actual: str = request.form["contrasenaActual"]
    except KeyError:
        flash("Error en la petición. Revisa los campos.", "error")
        return redirect(url_for("usuarios.pagina_datos_usuario"))

    mensaje_validacion = validar_campos(nombre, apellido, correo)
    if mensaje_validacion is not None:
        flash(mensaje_validacion, "error")
        return redirect(url_for("usuarios.pagina_datos_usuario"))

    usuario.nombre = nombre
    usuario.apellido = apellido
    if nueva_contrasena != "":
        if not usuario.checa_contrasena(contrasena_actual):
            flash("La contraseña actual es incorrecta", "error")
            return redirect(url_for("usuarios.pagina_datos_usuario"))
        if nueva_contrasena != nueva_contrasena2:
            flash("Las contraseñas no son iguales", "error")
            return redirect(url_for("usuarios.pagina_datos_usuario"))
        usuario.asigna_contrasena(nueva_contrasena)

    db.session.add(usuario)
    db.session.commit()

    if nueva_contrasena != "":
        session.pop("usuario_id", None)
        flash("Datos actualizados. Vuelve a iniciar sesión", "exito")
        return redirect(url_for("sesion.pagina_inicio_de_sesion"))
    flash("Datos actualizados.", "exito")
    return redirect(url_for("usuarios.pagina_datos_usuario"))
