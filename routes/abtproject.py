"""
    abtproject.py
"""
from flask import Blueprint, render_template, request

abtproject_blueprint = Blueprint("abtproject", __name__)


@abtproject_blueprint.route("/abtproject", methods=["GET", "POST"])
def abtproject():
    """ABC"""
    if request.method == "GET":
        return render_template("proyect.html")
