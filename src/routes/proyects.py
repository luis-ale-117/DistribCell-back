"""
    proyects.py
"""
# imports
from flask import Blueprint, render_template, request

#
proyects_blueprint = Blueprint("proyects", __name__)
# ruta de login
@proyects_blueprint.route("/new", methods=["POST"])
def new():
    print("new")
    if request.method == "POST":
        return "NEW"


@proyects_blueprint.route("/update", methods=["POST"])
def update():
    print("update")
    if request.method == "POST":
        return "UPDATE"


@proyects_blueprint.route("/delete", methods=["POST"])
def delete():
    print("delete")
    if request.method == "POST":
        return "DELETE"


@proyects_blueprint.route("/show", methods=["POST"])
def delete():
    print("show")
    if request.method == "GET":
        return "SHOW"
