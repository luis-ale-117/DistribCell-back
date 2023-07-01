"""
    app.py
"""
import os
from flask import Flask

from routes.ejecucion import home
from routes.info import aboutus, abtproject
from routes.proyectos import proyectos
from routes.usuario import login, signup, users
from utils.db import db


app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET", "luisillo")

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


# Routes
app.register_blueprint(home.blueprint)
app.register_blueprint(aboutus.blueprint)
app.register_blueprint(abtproject.blueprint)
app.register_blueprint(proyectos.blueprint)
app.register_blueprint(login.blueprint)
app.register_blueprint(signup.blueprint)
app.register_blueprint(users.blueprint)

# Creamos la base de datos si no ha sido creada
db.init_app(app)
with app.app_context():
    db.create_all()

# Iniciamos
if __name__ == "__main__":
    app.run()
