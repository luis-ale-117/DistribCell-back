"""
    login.py
"""
    #Imports

#libreria para hashear la contraseña
from functools import wraps
import hashlib
#libreria de flask con blueprint para rutas, render_template para html, y request para peticiones
from flask import Blueprint, redirect, render_template, request, session, url_for
#importamos de models a la clase usuarios para poder crear a los usuarios con la misma estructura.   
from models.User import User
#importamos la bd para realizar consultas, inserciones, etc.
from utils.db import db
#importamos la clave
from models.Key import Key
#import session


    #
#Variable Blueprint para el login
login_blueprint = Blueprint('login', __name__)
#Agregamos ruta de login
@login_blueprint.route('/login',methods=['GET','POST','DELETE'])


#definimos la funcion login()
def login():
    #Si recibe GET renderisa el templae login.html
    if request.method == 'GET':
        return render_template('login.html')
    #Si recibe POST
    if request.method == 'POST':
        #res = request.get_json('login')          #Obtenemos el json
        email = request.form['email'] #email = res['user']['email']                #Obtenemos email 
        #Obtenemos password hasheada con clave
        password = hashlib.sha256((request.form['password']+Key.key).encode('utf-8')).hexdigest() #password = hashlib.sha256((res['user']['password']+Key.key).encode('utf-8')).hexdigest()
        #Iniciamos la conexion a la bd
        try:
            #stmt = Select email from users where email = email and password = password
            #stmt = db.select(Users.email).where(Users.email == email).where(Users.password == password)
            #ejecutamos stmt y devuelve solo unna fila con fetchone()
            #resultado = db.session.execute(stmt).fetchone()
            resp = db.session.query(User).filter(User.email == email).filter(User.password == password).first()
            #Si no existen usuario 
            if resp is None:
                return {'Mensaje':'Usuario o contraseña incorrecta'}
            else:
                session['email'] = email
                session['name'] = resp.name
                session['lastname'] = resp.lastname
                print(session['email'])
                return redirect('/dashboard')
        except Exception as e: 
            print(e)
            return e 
    if request.method == 'DELETE':
        return render_template('login.html')
    
@login_blueprint.route("/logout",methods=['GET','DELETE'])
def logout():
    session.pop('email', None)
    session.pop('name', None)
    session.pop('lastname', None)
    return redirect('/')