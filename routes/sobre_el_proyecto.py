"""
sobre_el_proyecto.py
Modulo para mostrar inforamcion sobre el proyecto
"""
from flask import render_template, Blueprint

blueprint = Blueprint("sobre_el_proyecto", __name__)


@blueprint.route("/sobre_el_proyecto", methods=["GET"])
def pagina_sobre_el_proyecto():
    """ABC"""
    return render_template("sobre_el_proyecto.html")
