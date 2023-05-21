"""
    abtproject.py
"""
    #Imports

#libreria para hashear la contraseña
import hashlib
#libreria de flask con blueprint para rutas, render_template para html, y request para peticiones
from flask import Blueprint, redirect, render_template, request

    #
#Variable Blueprint para el acerca del proyecto
abtproject_blueprint = Blueprint('abtproject', __name__)
#Agregamos ruta de acerca del proyecto
@abtproject_blueprint.route('/abtproject',methods=['GET','POST'])

#Variable para saber si esta loggeado.


#definimos la funcion abtproject()
def abtproject():
    #Si recibe GET renderisa el templae proyect.html
    if request.method == 'GET':
        return render_template('proyect.html')    