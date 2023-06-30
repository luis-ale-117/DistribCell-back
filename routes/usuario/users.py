"""
    users.py
"""
from flask import redirect, session, Blueprint
from models.user import User
from utils.db import db

blueprint = Blueprint("users", __name__)


@blueprint.route("/delete", methods=["GET", "POST", "DELETE"])
def delete():
    """ABC"""
    email = session["email"]
    db.session.query(User).filter(User.email == email).delete()
    db.session.commit()
    print("va a regresar")
    return redirect("/logout")


def update():
    """ABC"""
    email = session["email"]
    user = db.session.query(User).filter(User.email == email)
    print(user)
