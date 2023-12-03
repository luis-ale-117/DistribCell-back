"""
inicio.py
Pagina principal de bienvenida del proyecto. También
es la pagina principal de ejecución de los autómatas
"""
from flask import render_template, Blueprint, session
from models import Usuarios

blueprint = Blueprint("inicio", __name__)


@blueprint.route("/", methods=["GET"])
def pagina_inicio():
    """Muestra la pagina de inicio"""
    usuario = None
    if "usuario_id" in session:
        usuario = Usuarios.query.get(session["usuario_id"])
    return render_template("inicio.html", usuario=usuario, titulo="Autómatas Celulares")
