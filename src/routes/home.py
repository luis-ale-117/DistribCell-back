"""
    home.py
"""
    #Imports

#libreria para hashear la contraseña
import hashlib
#libreria de flask con blueprint para rutas, render_template para html, y request para peticiones
from flask import Blueprint, redirect, render_template, request

    #
#Variable Blueprint para el home
home_blueprint = Blueprint('home', __name__)
#Agregamos ruta de home
@home_blueprint.route('/',methods=['GET','POST'])

#Variable para saber si esta loggeado.


#definimos la funcion home()
def home():
    #Si recibe GET renderisa el templae home.html
    if request.method == 'GET':
        return render_template('home.html')