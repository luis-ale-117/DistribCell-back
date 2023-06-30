"""
    proyectos.py
"""
from flask import request, Blueprint

blueprint = Blueprint("proyectos", __name__)


@blueprint.route("/new", methods=["POST"])
def new():
    """ABC"""
    if request.method == "POST":
        return "NEW"
    return None


@blueprint.route("/update", methods=["POST"])
def update():
    """ABC"""
    if request.method == "POST":
        return "UPDATE"
    return None


@blueprint.route("/delete", methods=["POST"])
def delete():
    """ABC"""
    if request.method == "POST":
        return "DELETE"
    return None
