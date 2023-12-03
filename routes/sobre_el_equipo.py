"""
sobre_el_equipo.py
Modulo para mostrar información sobre los integrantes
del equipo
"""
from flask import render_template, session, Blueprint
from models import Usuarios

blueprint = Blueprint("sobre_el_equipo", __name__)


@blueprint.route("/sobre_el_equipo", methods=["GET"])
def pagina_sobre_el_equipo():
    """Regresa la pagina de información del equipo"""
    usuario = None
    if "usuario_id" in session:
        usuario = Usuarios.query.get(session["usuario_id"])
    return render_template("sobre_el_equipo.html", usuario=usuario, titulo="Nosotros")
