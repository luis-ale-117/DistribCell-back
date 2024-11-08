"""
sobre_el_proyecto.py
Modulo para mostrar información sobre el proyecto
"""
from flask import render_template, session, Blueprint
from models import Usuarios

blueprint = Blueprint("sobre_el_proyecto", __name__)


@blueprint.route("/sobre_el_proyecto", methods=["GET"])
def pagina_sobre_el_proyecto():
    """Regresa la pagina de información del proyecto"""
    usuario = None
    if "usuario_id" in session:
        usuario = Usuarios.query.get(session["usuario_id"])
    return render_template(
        "sobre_el_proyecto.html", usuario=usuario, titulo="Sobre el proyecto"
    )
