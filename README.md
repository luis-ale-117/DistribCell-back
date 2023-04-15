# DistribCell-back
Repo with the backend devolpment of the Cellular Automaton project for TT

## Programs
***
All the programs you must have to run.
```
$ Python10
$ mysql
```
### Installation
***
A little intro about the installation.

First clone the repository of the project
```bash
git clone https://github.com/luis-ale-117/DistribCell-back.git
```
Go to the projecto directory and create a virtual environment to install python packages only for this project and don't affect your global installation
```bash
python -m venv .env
```
The above command will create a directory called `.env` that will store the python version and packages for this project. To activate your virtual environment you must run the following command on every terminal you open for this project directory.

For linux
```bash
source venv/bin/activate
```
For windows
```cmd
.env\Scripts\activate.bat
```
You may also need to install some headers and libraries in order to install `mysqlclient` library. For debian and ubuntu use
```bash
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential
```
For further information visit [pip reference](https://pypi.org/project/mysqlclient/).
Once the virtual environment is up, run the following command to update `pip` and install `wheel` and `setuptools` to avoid possible warnings and errors when installing the libraries.
```bash
pip install wheel setuptools pip --upgrade
```
The required libraries are in the `requirements.txt` file, to install them run the following command
```bash
pip install -r requirements.txt
```
To start the project go to the `src` directory and run the following command
```bash
python index.py
```
If you install or delete any library run the following command to update `requiremets.txt`
```bash
pip freeeze > requirements.txt
```

