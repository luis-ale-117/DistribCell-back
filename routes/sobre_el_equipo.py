"""
sobre_el_equipo.py
Modulo para mostrar inforamcion sobre los integrantes
del equipo
"""
from flask import render_template, Blueprint

blueprint = Blueprint("sobre_el_equipo", __name__)


@blueprint.route("/sobre_el_equipo", methods=["GET"])
def pagina_sobre_el_equipo():
    """Regresa la pagina de informacion del equipo"""
    return render_template("sobre_el_equipo.html")
