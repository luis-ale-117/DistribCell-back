"""
    aboutus.py
"""
    #Imports

#libreria para hashear la contraseña
import hashlib
#libreria de flask con blueprint para rutas, render_template para html, y request para peticiones
from flask import Blueprint, redirect, render_template, request

    #
#Variable Blueprint para el home
aboutus_blueprint = Blueprint('aboutus', __name__)
#Agregamos ruta de home
@aboutus_blueprint.route('/aboutus',methods=['GET','POST'])

#Variable para saber si esta loggeado.


#definimos la funcion aboutus()
def aboutus():
    #Si recibe GET renderisa el templae home.html
    if request.method == 'GET':
        return render_template('aboutus.html')    