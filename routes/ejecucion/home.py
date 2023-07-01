"""
    home.py
"""
from flask import render_template, Blueprint, session
from models.user import User

blueprint = Blueprint("home", __name__)


@blueprint.route("/", methods=["GET"])
def inicio():
    """Muestra la pagina de inicio"""
    usuario = None
    if "usuario_id" in session:
        usuario = User.query.get_or_404(session["usuario_id"])
    return render_template("inicio.html", usuario=usuario)
