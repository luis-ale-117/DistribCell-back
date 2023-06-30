"""
    aboutus.py
"""
from flask import render_template, request, Blueprint

blueprint = Blueprint("aboutus", __name__)


@blueprint.route("/aboutus", methods=["GET", "POST"])
def aboutus():
    """ABC"""
    if request.method == "GET":
        return render_template("aboutus.html")
    return None
