"""
    signup.py
"""
# Imports

# libreria para hashear la contraseña
import hashlib

# libreria de flask con blueprint para rutas, render_template para html, y request para peticiones
from flask import Blueprint, render_template, request

# importamos de models a la clase usuarios para poder crear a los usuarios con la misma estructura.
from models.User import User

# importamos la bd para realizar consultas, inserciones, etc.
from utils.db import db

# importamos la clave
from models.Key import Key

#
# Variable Blueprint para el registro
signup_blueprint = Blueprint("signup", __name__)
# Agregamos ruta de signup
@signup_blueprint.route("/signup", methods=["GET", "POST"])
# Funcion signup()
def signup():
    # Si la peticion es GET renderisa signup.html
    if request.method == "GET":
        return render_template("signup.html")
    # Si la peticion es POST
    if request.method == "POST":
        res = request.get_json("signup")  # Obtenemos el json
        name = res["user"]["name"]  # Obtenemos Nombres
        lastname = res["user"]["lastname"]  # Obtenemos Apellidos
        email = res["user"]["email"]  # Obtenemos Email
        # Obtenemos password hasheada con clave
        password = hashlib.sha256(
            (res["user"]["password"] + Key.key).encode("utf-8")
        ).hexdigest()
        try:
            # stmt = SELECT email from Users where email = email
            stmt = db.select(User.email).where(User.email == email)
            # ejecutamos stmt y devuelve solo unna fila con fetchone()
            resultado = db.session.execute(stmt).fetchone()
            # Si el correo no existe, se puede registrar
            if resultado is None:
                # Creamos un nuevo Usuario
                new_user = User(email, password, name, lastname)
                db.session.add(new_user)  # Agregamos al nuevo usuario
                db.session.commit()  # Commit
                return {"Mensaje": "Usuario registrado"}
            else:
                return {"Mensaje": "Usuario ya registrado, intenta con otro correo"}
        except Exception as e:
            print(e)
            return e
