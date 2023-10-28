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
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from app import app
from models import Usuarios
from utils.db import db
from utils.validacion import validar_campos_nuevo_usuario

blueprint = Blueprint("registro_usuario", __name__)

mail = Mail(app)
serializer = URLSafeTimedSerializer(app.secret_key)


def genera_token_confirmacion(email: str):
    """Genera el token de confirmacion de correo electronico"""
    return serializer.dumps(email, salt=app.config["SALT_EMAIL"])


def confirma_token(token, expiration=3600):  # 1 hora
    """Confirma el token de confirmacion de correo electronico"""
    email = serializer.loads(token, salt=app.config["SALT_EMAIL"], max_age=expiration)
    return email


def enviar_correo(correo: str, asunto: str, template: str):
    """Envia el correo electronico"""
    msg = Message(
        subject=asunto,
        sender=app.config["MAIL_DEFAULT_SENDER"],
        html=template,
        recipients=[correo],
    )
    mail.send(msg)


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
    mensaje_validacion = validar_campos_nuevo_usuario(
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
    # Para test se limita a 5 usuarios registrados
    if Usuarios.query.count() >= 5:
        flash("Limite de usuarios alcanzado: 5", "advertencia")
        return redirect(url_for("registro_usuario.pagina_registro_usuario"))
    db.session.add(usuario)
    db.session.commit()

    # Genera el token de confirmacion de correo electronico
    token = genera_token_confirmacion(correo)
    url_confirmacion = url_for("confirmar_correo", token=token, _external=True)
    temp = render_template(
        "confirmar_correo.html", usuario=None, url_confirmacion=url_confirmacion
    )
    enviar_correo(correo, "Confirmacion de correo", temp)
    # Envia el token
    flash("Registrado. Te enviamos un correo de confirmacion.", "exito")
    return redirect(url_for("inicio.pagina_inicio"))


@blueprint.route("/confirma_correo/<token>")
def confirmar_correo(token):
    """Confirma el correo electronico"""
    try:
        correo = confirma_token(token)
    except SignatureExpired:
        flash("El token ha expirado, registrate nuevamente.", "advertencia")
        return redirect("/usuario/registro")
    except BadSignature:
        flash("El token es invalido, registrate nuevamente.", "error")
        return redirect("/usuario/registro")
    except Exception:
        flash("Error desconocido, registrate nuevamente", "error")
        return redirect("/usuario/registro")

    if correo is None:
        flash("El token ha expirado, registrate nuevamente.", "advertencia")
        return redirect("/usuario/registro")

    usuario = Usuarios.query.filter_by(correo=correo).first_or_404()
    if usuario.confirmado:
        flash("El correo ya ha sido confirmado, por favor inicia sesion", "info")
        return redirect("/usuario/inicio_sesion")
    usuario.confirmado = True
    db.session.add(usuario)
    db.session.commit()
    flash("Haz confirmado tu correo, gracias!", "exito")
    return redirect("/usuario/inicio_sesion")
