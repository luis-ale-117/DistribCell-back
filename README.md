# DistribCell-back
Repo with the backend devolpment of the Cellular Automaton project for TT

## Programs
***
All the programs you must have to run.
```
$ git
$ Python10
$ mysql or mariadb (For linux)
```
### Installation
***
A little intro about the installation.

First clone the repository of the project

Using ssh (recommended)
```bash
git clone git@github.com:luis-ale-117/DistribCell-back.git
```
Using https
```bash
git clone https://github.com/luis-ale-117/DistribCell-back.git
```
Go to the project directory and create a virtual environment to install python packages only for this project and don't affect your global installation
```bash
python -m venv .env
```
The above command will create a directory called `.env` that will store the python version and packages for this project. To activate your virtual environment you must run the following command on every terminal you open for this project directory.

For linux
```bash
source .env/bin/activate
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
If you install or delete any library run the following command to update `requirements.txt`
```bash
pip freeeze > requirements.txt
```

## Contribution
For contributing to this repository and send your changes, first you need to create a `new branch` where you can save your changes without affecting `main`. To create a new branch use
```bash
git checkout -b <new-branch-with-meaningfull-short-name>
```
> NOTE: `main` branch is protected, so you always need to create a new branch to publish your changes.

Once you are in the `new branch` you can safely make your changes.
To see the list of branches you have use
```bash
git branch
```
> NOTE: Exit pressing `q` on the keyboard

To change between branches use the following command
```bash
git checkout <branch-name>
```
To see the commits (like checkpoints) of the current branch use
```bash
git log
```
> NOTE: Exit pressing `q` on the keyboard

To save your changes on a commit, first go to the root directory of this project and execute
```bash
git add .
```
Then make a commit of the changes you made with descriptive message of them using
```bash
git commit -m "<Great-description-of-your-changes>"
```
> TIP: Make small changes and commit them frecuently so if you break something you can rollback to a previous commit.

Once all your changes and commits are ready, send them to the remote repository on github using
```bash
git push origin <your-branch-name>
```
After that command your branch with your changes are on GitHub, now you need to create a `pull request` to merge `your branch` into `main`. So go to this project on GitHub logged with your account. If you recently `pushed` your changes, you should see a warning that says "< your-branch > had recent pushes", with a green button that says "Compare & pull request".

Clic the green button and navigate until see another green button to make the pull request. Leave a bref and descriptive title and comment anything you want on the corresponding section.