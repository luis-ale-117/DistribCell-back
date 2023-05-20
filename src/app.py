"""
    app.py
"""
#Imports
from flask import Flask                             #Flask
from routes.login import login_blueprint            #ruta login
from routes.signup import signup_blueprint      #ruta register
from routes.home import home_blueprint              #ruta home
from routes.dashboard import dashboard_blueprint    #ruta dashboard
from routes.users import users_blueprint             #ruta users
from routes.aboutus import aboutus_blueprint        #ruta aboutus
from routes.abtproject import abtproject_blueprint  #ruta abtproject
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
from utils.db import db
import os
#Inicia Flask
app = Flask(__name__)

#configuracion de app para la base de datos

# Configuracion de la base de datos
# Obtener los datos de la base de datos desde las variables de entorno
# Si no existen, se usan los valores por defecto
DB_USER = os.getenv("DB_USER","root")
DB_PASSWORD = os.getenv("DB_PASSWORD","Mart123.v")
DB_HOST = os.getenv("DB_HOST","localhost")
DB_PORT = os.getenv("DB_PORT","3306")
DB_NAME = os.getenv("DB_NAME","tt")

db_uri = f"mysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
#creamos la base de datos si no ha sido creada
engine = create_engine(db_uri)       
if not database_exists(engine.url):
    create_database(engine.url)
app.config["SQLALCHEMY_DATABASE_URI"] = db_uri #Conexion a mysql
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

#Routes
app.register_blueprint(home_blueprint)
app.register_blueprint(login_blueprint)
app.register_blueprint(signup_blueprint)
app.register_blueprint(dashboard_blueprint)
app.register_blueprint(users_blueprint)
app.register_blueprint(aboutus_blueprint)
app.register_blueprint(abtproject_blueprint)