"""
sobre_el_proyecto.py
Modulo para mostrar inforamcion sobre el proyecto
"""
from flask import render_template, session, Blueprint
from models.usuarios import Usuarios

blueprint = Blueprint("sobre_el_proyecto", __name__)


@blueprint.route("/sobre_el_proyecto", methods=["GET"])
def pagina_sobre_el_proyecto():
    """Regresa la pagina de informacion del proyecto"""
    usuario = None
    if "usuario_id" in session:
        usuario = Usuarios.query.get_or_404(session["usuario_id"])
    return render_template("sobre_el_proyecto.html", usuario=usuario)
