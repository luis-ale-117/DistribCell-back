"""
    login.py
"""
from flask import Blueprint, redirect, render_template, request, session
from models.user import User
from utils.db import db

login_blueprint = Blueprint("login", __name__)


@login_blueprint.route("/login", methods=["GET", "POST", "DELETE"])
def login():
    """ABC"""
    if request.method == "GET":
        return render_template("login.html")
    if request.method == "POST":
        email = request.form["email"]
        password = None
        resp = (
            db.session.query(User)
            .filter(User.email == email)
            .filter(User.password == password)
            .first()
        )
        if resp is None:
            return render_template(
                "login.html", error="Usuario o contraseña incorrectos"
            )
        return None
    if request.method == "DELETE":
        return render_template("login.html", error="Algo no esta bien")
    return {"otra": "cosa"}


@login_blueprint.route("/logout", methods=["GET", "DELETE"])
def logout():
    """ABC"""
    session.pop("email", None)
    session.pop("name", None)
    session.pop("lastname", None)
    return redirect("/")
