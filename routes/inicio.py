"""
inicio.py
Pagina principal de bienvenidad del proyecto. Tambien
es la pagina principal de ejecucion de los automatas
"""
from flask import render_template, Blueprint, session
from models.usuarios import Usuarios

blueprint = Blueprint("inicio", __name__)


@blueprint.route("/", methods=["GET"])
def pagina_inicio():
    """Muestra la pagina de inicio"""
    usuario = None
    if "usuario_id" in session:
        usuario = Usuarios.query.get_or_404(session["usuario_id"])
    return render_template("inicio.html", usuario=usuario)
