"""
app.py
Modulo de configuracion e inicio de ejecucion
de la aplicacion web principal
"""
import os
from datetime import timedelta
from flask import Flask
from flask_migrate import Migrate
from routes import (
    inicio,
    inicio_sesion,
    simulaciones,
    registro_usuario,
    sobre_el_equipo,
    sobre_el_proyecto,
    usuarios,
)
from utils.db import db


app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET", "luisillo")
app.permanent_session_lifetime = timedelta(days=1)

DB_URI = os.getenv("DB_URI")
if DB_URI is None:
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "Mart123.v")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "tt")
    DB_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

app.config["SQLALCHEMY_DATABASE_URI"] = DB_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", "465"))
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER")
app.config["MAIL_PASSWORD"] = os.getenv(
    "MAIL_PASSWORD"
)  # No la contrasena del correo, checar: https://youtu.be/g_j6ILT-X0k
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "false").lower() == "true"
app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "true").lower() == "true"
app.config["SALT_EMAIL"] = os.getenv("SALT_EMAIL", "my super secret salt")

# Routes
app.register_blueprint(inicio.blueprint)
app.register_blueprint(sobre_el_equipo.blueprint)
app.register_blueprint(sobre_el_proyecto.blueprint)
app.register_blueprint(simulaciones.blueprint)
app.register_blueprint(inicio_sesion.blueprint)
app.register_blueprint(registro_usuario.blueprint)
app.register_blueprint(usuarios.blueprint)

db.init_app(app)
migrate = Migrate(app, db)
with app.app_context():
    db.create_all()

# Iniciamos
if __name__ == "__main__":
    app.run()
