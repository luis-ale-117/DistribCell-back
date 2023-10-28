"""
app.py
Modulo de configuracion e inicio de ejecucion
de la aplicacion web principal
"""
import os
from datetime import timedelta
from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_migrate import Migrate
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from routes import (
    inicio,
    inicio_sesion,
    simulaciones,
    registro_usuario,
    sobre_el_equipo,
    sobre_el_proyecto,
    usuarios,
)
from models import Usuarios
from utils.validacion import validar_campos_nuevo_usuario
from utils.db import db


app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET", "luisillo")
app.permanent_session_lifetime = timedelta(days=1)

# DB_URI = os.getenv("DB_URI")
# if DB_URI is None:
#     DB_USER = os.getenv("DB_USER", "root")
#     DB_PASSWORD = os.getenv("DB_PASSWORD", "Mart123.v")
#     DB_HOST = os.getenv("DB_HOST", "localhost")
#     DB_PORT = os.getenv("DB_PORT", "3306")
#     DB_NAME = os.getenv("DB_NAME", "tt")
#     DB_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
# app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
# app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", "465"))
# app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
# app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
# app.config["MAIL_PASSWORD"] = os.getenv(
#     "MAIL_PASSWORD"
# )  # No la contrasena del correo, checar: https://youtu.be/g_j6ILT-X0k
# app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "false").lower() == "true"
# app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "true").lower() == "true"
# app.config["SALT_EMAIL"] = os.getenv("SALT_EMAIL", "my super secret salt")

# mail = Mail(app)
# serializer = URLSafeTimedSerializer(app.secret_key)


# # SECCION DE REGISTRO DE USUARIOS, no los pude separar :c
# def genera_token_confirmacion(email: str):
#     """Genera el token de confirmacion de correo electronico"""
#     return serializer.dumps(email, salt=app.config["SALT_EMAIL"])


# def confirma_token(token, expiration=3600):  # 1 hora
#     """Confirma el token de confirmacion de correo electronico"""
#     email = serializer.loads(token, salt=app.config["SALT_EMAIL"], max_age=expiration)
#     return email


# def enviar_correo(correo: str, asunto: str, template: str):
#     """Envia el correo electronico"""
#     msg = Message(
#         subject=asunto,
#         sender=app.config["MAIL_DEFAULT_SENDER"],
#         html=template,
#         recipients=[correo],
#     )
#     mail.send(msg)


# @registro_usuario.blueprint.route("/registro_usuario", methods=["POST"])
# def crea_usuario():
#     """Crea el usuario"""
#     if "usuario_id" in session:
#         return redirect(url_for("inicio.pagina_inicio"))
#     try:
#         nombre = request.form["nombre"].strip()
#         apellido = request.form["apellido"].strip()
#         correo = request.form["correo"].strip()
#         contrasena = request.form["contrasena"]
#         contrasena2 = request.form["contrasena2"]
#     except KeyError:
#         flash("Error en la peticion. Revisa los campos.", "error")
#         redirect(url_for("registro_usuario.pagina_registro_usuario"))

#     # Validar campos
#     mensaje_validacion = validar_campos_nuevo_usuario(
#         nombre, apellido, correo, contrasena, contrasena2
#     )
#     if mensaje_validacion is not None:
#         flash(mensaje_validacion, "error")
#         return redirect(url_for("registro_usuario.pagina_registro_usuario"))

#     usuario = Usuarios.query.filter_by(correo=correo).first()

#     if usuario and usuario.confirmado:
#         flash("Correo no dispoible", "advertencia")
#         return redirect(url_for("registro_usuario.pagina_registro_usuario"))

#     if usuario and not usuario.confirmado:
#         # Si el usuario esta sin confirmar, actualiza los campos
#         usuario.nombre = nombre
#         usuario.apellido = apellido
#         usuario.asigna_contrasena(contrasena)
#     else:
#         # Si el usuario no existe, crea uno nuevo
#         usuario = Usuarios(nombre, apellido, correo, contrasena)

#     # Para test se limita a 5 usuarios registrados
#     if Usuarios.query.count() >= 5:
#         flash("Limite de usuarios alcanzado: 5", "advertencia")
#         return redirect(url_for("registro_usuario.pagina_registro_usuario"))
#     db.session.add(usuario)
#     db.session.commit()

#     # Genera el token de confirmacion de correo electronico
#     token = genera_token_confirmacion(correo)
#     url_confirmacion = url_for(
#         "registro_usuario.confirmar_correo", token=token, _external=True
#     )
#     temp = render_template(
#         "confirmar_correo.html", usuario=None, url_confirmacion=url_confirmacion
#     )
#     enviar_correo(correo, "Confirmacion de correo", temp)

#     flash(
#         "Registrado. Te enviamos un correo de confirmacion. (Tienes 1h para confirmar)",
#         "exito",
#     )
#     return redirect(url_for("inicio.pagina_inicio"))


# @registro_usuario.blueprint.route("/confirma_correo/<token>")
# def confirmar_correo(token):
#     """Confirma el correo electronico"""
#     try:
#         correo = confirma_token(token)
#     except SignatureExpired:
#         flash("El token ha expirado, registrate nuevamente.", "advertencia")
#         return redirect("/registro_usuario")
#     except BadSignature:
#         flash("El token es invalido, registrate nuevamente.", "error")
#         return redirect("/registro_usuario")
#     except Exception:
#         flash("Error desconocido, registrate nuevamente", "error")
#         return redirect("/registro_usuario")

#     if correo is None:
#         flash("El token ha expirado, registrate nuevamente.", "advertencia")
#         return redirect("/registro_usuario")

#     usuario = Usuarios.query.filter_by(correo=correo).first_or_404()
#     if usuario.confirmado:
#         flash("El correo ya ha sido confirmado, por favor inicia sesion", "info")
#         return redirect("/inicio_sesion")
#     usuario.confirmado = True
#     db.session.add(usuario)
#     db.session.commit()
#     flash("Haz confirmado tu correo, gracias!", "exito")
#     return redirect("/inicio_sesion")


# # Routes
# app.register_blueprint(inicio.blueprint)
# app.register_blueprint(sobre_el_equipo.blueprint)
# app.register_blueprint(sobre_el_proyecto.blueprint)
# app.register_blueprint(simulaciones.blueprint)
# app.register_blueprint(inicio_sesion.blueprint)
# app.register_blueprint(registro_usuario.blueprint)
# app.register_blueprint(usuarios.blueprint)

# db.init_app(app)
# migrate = Migrate(app, db)
# with app.app_context():
#     db.create_all()

@app.route("/")
def index():
    return "ok"

# Iniciamos
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
