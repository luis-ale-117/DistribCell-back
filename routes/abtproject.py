"""
    abtproject.py
"""
from flask import render_template, request, Blueprint

blueprint = Blueprint("abtproject", __name__)


@blueprint.route("/abtproject", methods=["GET", "POST"])
def abtproject():
    """ABC"""
    if request.method == "GET":
        return render_template("sobre_el_proyecto.html")
    return None
