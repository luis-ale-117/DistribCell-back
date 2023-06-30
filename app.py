"""
    app.py
"""
import os
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database

from routes.ejecucion import home
from routes.info import aboutus, abtproject
from routes.proyectos import proyectos
from routes.usuario import login, signup, users
from utils.db import db


app = Flask(__name__)

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Mart123.v")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "tt")

db_uri = f"mysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
# creamos la base de datos si no ha sido creada
engine = create_engine(db_uri)
if not database_exists(engine.url):
    create_database(engine.url)
app.config["SQLALCHEMY_DATABASE_URI"] = db_uri  # Conexion a mysql
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

# Routes
app.register_blueprint(home.blueprint)
app.register_blueprint(aboutus.blueprint)
app.register_blueprint(abtproject.blueprint)
app.register_blueprint(proyectos.blueprint)
app.register_blueprint(login.blueprint)
app.register_blueprint(signup.blueprint)
app.register_blueprint(users.blueprint)

with app.app_context():
    db.create_all()

# Iniciamos
if __name__ == "__main__":
    app.secret_key = os.getenv("APP_SECRET", "luisillo")
    app.run(host="0.0.0.0", debug=True)
