"""
    proyectos.py
"""
from flask import Blueprint, request


proyectos_blueprint = Blueprint("proyectos", __name__)


@proyectos_blueprint.route("/new", methods=["POST"])
def new():
    """ABC"""
    print("new")
    if request.method == "POST":
        return "NEW"


@proyectos_blueprint.route("/update", methods=["POST"])
def update():
    """ABC"""
    print("update")
    if request.method == "POST":
        return "UPDATE"


@proyectos_blueprint.route("/delete", methods=["POST"])
def delete():
    """ABC"""
    print("delete")
    if request.method == "POST":
        return "DELETE"
