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
### MySQL setup
Once you have installed MySQL or MariaDB (recommended for linux) and you are able to connect to MySQL as `root` user, create a new user with
```sql
CREATE USER '<user>'@'localhost' IDENTIFIED BY '<password>';
```
Then grant this `new user` access to a `new database` with the following command
```sql
GRANT ALL PRIVILEGES ON <database-name>.* TO '<user>'@'localhost';
```
After that, login with the new `user` credentials to MySQL and create the database with
```sql
CREATE DATABASE <database-name>; 
```
### Installation
***

First clone the repository of the project

If you already did the ssh key setup on your computer, you can clone the project using ssh (recommended). Otherwise, you can do the setup following [this guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) and then clone the project using ssh. If you don't want to do the setup, you can clone the project using https (not recommended) following [this guide](https://gitprotect.io/blog/how-to-clone-using-https-in-git/).

If you are using `ssh` and `Git Bash` for windows, you may need to reload the ssh keys before cloning the project. To do that, run the following command on `Git Bash`
```bash
eval $(ssh-agent -s)
```
and then
```bash
ssh-add ~/.ssh/<your-private-key-name>
```

Finally, clone the project

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
The above command will create a directory called `.env` that will store the python version and packages for this project.

Before activating your virtual environment, you need to set the database credentials on your python virtual environment. Go to `.env/bin/` (for linux) or `.env\Scripts\` (for windows). 

For linux open the file `activate` and add the following lines at the bottom
```bash
export DB_USER=<user>
export DB_PASSWORD=<password>
export DB_NAME=<database-name>
# export DB_HOST=<host> # Optional
# export DB_PORT=<port> # Optional
```
For windows open the file `activate.bat` and add the following lines at the bottom
```cmd
set DB_USER=<user>
set DB_PASSWORD=<password>
set DB_NAME=<database-name>
:: set DB_HOST=<host> :: Optional
:: set DB_PORT=<port> :: Optional
```
> NOTE: If you don't set `DB_HOST` and `DB_PORT` the default values are `localhost` and `3306` respectively.

> NOTE: Once you have saved the file, every time you activate your virtual environment the database credentials will be set on current terminal.

To activate your virtual environment you must run the following command on every terminal you open for this project directory.

For linux
```bash
source .env/bin/activate
```
For windows
```cmd
.env\Scripts\activate.bat
```
> NOTE: To deactivate the virtual environment run `deactivate` on the terminal.

You may also need to install some headers and libraries in order to install `mysqlclient` library. For debian and ubuntu use
```bash
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential
```
For further information visit [mysqlclient reference](https://pypi.org/project/mysqlclient/).

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
> NOTE: This also create all the tables and relations needed for the project.

> NOTE: To exit the program press `Ctrl + C` on the terminal.

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