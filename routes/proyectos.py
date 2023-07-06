"""
proyectos.py
SIN IMPLEMENTAR
"""
from flask import Blueprint

blueprint = Blueprint("proyectos", __name__)


@blueprint.route("/crear_proyecto", methods=["POST"])
def crear_proyecto():
    """ABC"""
    return "NEW"


@blueprint.route("/actualizar_proyecto", methods=["POST"])
def actualizar_proyecto():
    """ABC"""
    return "UPDATE"


@blueprint.route("/borrar_proyecto", methods=["POST"])
def borrar_proyecto():
    """ABC"""
    return "DELETE"
