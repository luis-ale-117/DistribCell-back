"""
    signup.py
"""
from flask import render_template, request, Blueprint
from models.user import User
from utils.db import db

blueprint = Blueprint("signup", __name__)


@blueprint.route("/signup", methods=["GET", "POST"])
def signup():
    """ABC"""
    if request.method == "GET":
        return render_template("signup.html")
    if request.method == "POST":
        res = request.get_json("signup")
        name = res["user"]["name"]
        lastname = res["user"]["lastname"]
        email = res["user"]["email"]
        password = None  # Usar werafvasfd
        stmt = db.select(User.email).where(User.email == email)
        resultado = db.session.execute(stmt).fetchone()
        if resultado is None:
            new_user = User(email, password, name, lastname)
            db.session.add(new_user)
            db.session.commit()
            return {"Mensaje": "Usuario registrado"}
        return {"Mensaje": "Usuario ya registrado, intenta con otro correo"}
    return {"otra": "cosa"}
