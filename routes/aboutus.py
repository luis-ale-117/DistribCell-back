"""
    aboutus.py
"""
from flask import Blueprint, render_template, request

aboutus_blueprint = Blueprint("aboutus", __name__)


@aboutus_blueprint.route("/aboutus", methods=["GET", "POST"])
def aboutus():
    """ABC"""
    if request.method == "GET":
        return render_template("aboutus.html")
    return None
