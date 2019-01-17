# video-labeling-tool
Demo: http://smoke.createlab.org

A tool for labeling video clips (both front-end and back-end). The back-end depends on a [thumbnail server](https://github.com/CMU-CREATE-Lab/timemachine-thumbnail-server) to provides video urls. The back-end is based on [flask](http://flask.pocoo.org/). A flask tutorial can be found on [this blog](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world). 

# Install MySQL
Install and start mysql database. This assumes that Ubuntu is installed. A tutorial can be found on [this blog](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04).
```sh
sudo apt-get install mysql-server
sudo apt-get install libmysqlclient-dev
```
For Mac OS, I recommend installing mysql by using [Homebrew](https://brew.sh/).
```sh
brew install mysql
```
After installation, run the security script.
```sh
sudo mysql_secure_installation
```
If error occurs, it is likely that mysql server did not start. Run the followings to start mysql.
```sh
# For linux
sudo service mysql start

# For mac
brew services start mysql
```
Set the user name and password for the application. Replace [DATABASE_USERNAME] and [DATABASE_PASSWORD] with your desired database user name and password respectively.
```sh
sudo mysql -u root -p
# Run the followings in the mysql shell
CREATE USER '[DATABASE_USERNAME]'@'localhost' IDENTIFIED BY '[DATABASE_PASSWORD]';
GRANT ALL PRIVILEGES ON *.* TO '[DATABASE_USERNAME]'@'localhost' WITH GRANT OPTION;
```
Create the database in the mysql shell.
```sh
# If on the production server
create database video_labeling_tool_production;

# If on the development server or your local computer
create database video_labeling_tool_development;
```
If the database exists, drop it and then create it again in the mysql shell.
```sh
# For droping database on the production server
drop database video_labeling_tool_production;

# For droping database on the development server or your local computer
drop database video_labeling_tool_development;
```
# Setup back-end
Install conda. This assumes that Ubuntu is installed. A detailed documentation is [here](https://conda.io/docs/user-guide/getting-started.html). First visit [here](https://conda.io/miniconda.html) to obtain the downloading path. The following script install conda for all users:
```sh
wget https://repo.continuum.io/miniconda/Miniconda3-4.5.11-Linux-x86_64.sh
sudo sh Miniconda3-4.5.11-Linux-x86_64.sh -b -p /opt/miniconda3

sudo vim /etc/bash.bashrc
# Add the following lines to this file
export PATH="/opt/miniconda3/bin:$PATH"
. /opt/miniconda3/etc/profile.d/conda.sh

source /etc/bash.bashrc
```
For Mac OS, I recommend installing conda by using [Homebrew](https://brew.sh/).
```sh
brew cask install miniconda
echo 'export PATH="/usr/local/miniconda3/bin:$PATH"' >> ~/.bash_profile
echo '. /usr/local/miniconda3/etc/profile.d/conda.sh' >> ~/.bash_profile
source ~/.bash_profile
```
Clone this repository.
```sh
git clone https://github.com/CMU-CREATE-Lab/video-labeling-tool.git
sudo chown -R $USER video-labeling-tool
```
Create conda environment and install packages. It is important to install pip first inside the newly created conda environment.
```sh
conda create -n video-labeling-tool
conda activate video-labeling-tool
conda install pip
which pip # make sure this is the pip inside the video-labeling-tool environment
sh video-labeling-tool/back-end/install_packages.sh
```
Create a text file with name "google_signin_client_id" in the "back-end/data/" directory to store the client ID. For detailed documentation about how to obtain the client ID, refer to the [Google Sign-In API](https://developers.google.com/identity/sign-in/web/sign-in).
```sh
sudo vim video-labeling-tool/back-end/data/google_signin_client_id
# Add the following line to this file, obtained from the Google Sign-In API
XXXXXXXX.apps.googleusercontent.com
```
Create a text file with name "db_url" to store the database url in the "back-end/data/" directory. For the url format, refer to [the flask-sqlalchemy documentation](http://flask-sqlalchemy.pocoo.org/2.3/config/#connection-uri-format). Replace [DATABASE_USERNAME] and [DATABASE_PASSWORD] with the database user name and password respectively.
```sh
sudo vim video-labeling-tool/back-end/data/db_url
# Add the following line to this file (if on the production server)
mysql://[DATABASE_USERNAME]:[DATABASE_PASSWORD]@localhost/video_labeling_tool_production

# Add the following line to this file (if on the development server)
mysql://[DATABASE_USERNAME]:[DATABASE_PASSWORD]@localhost/video_labeling_tool_development
```
Generate the server private key. This will add a file "private_key" in the "back-end/data/" directory. The private key is used to sign the JWT (JSON Web Token) issued by the server.
```sh
cd video-labeling-tool/back-end/www/
python gen_key.py confirm
```
Create and upgrade the database by using the migration workfow documented on the [flask-migrate](https://flask-migrate.readthedocs.io/en/latest/) website. [This blog](https://www.patricksoftwareblog.com/tag/flask-migrate/) also provides a tutorial. The script "db.sh" enhances the workflow by adding the FLASK_APP environment.
```sh
sh db.sh upgrade
```
Here are some other migration commands that can be useful. You do not need to run these for normal usage.
```sh
# Generate the migration directory
sh db.sh init

# Generate the migration script
sh db.sh migrate "initial migration"

# Downgrade the database to a previous state
sh db.sh downgrade
```
Add testing videos (optional) or your own videos.
```sh
python add_video_set_small.py confirm
python add_video_set_large.py confirm
```
Run server in the conda environment for development purpose.
```sh
sh development.sh
```

# Deploy back-end using uwsgi
Install [uwsgi](https://uwsgi-docs.readthedocs.io/en/latest/) using conda.
```sh
conda activate video-labeling-tool
conda install -c conda-forge uwsgi
```
Run the uwsgi server to check if it works.
```sh
sh production.sh
curl localhost:8080
# Should get the "Hello World!" message
```
The server log is stored in the "back-end/log/uwsgi.log" file. Refer to the "back-end/www/uwsgi.ini" file for details. The documentation is on the [uwsgi website](https://uwsgi-docs.readthedocs.io/en/latest/Configuration.html). A custom log is stored in the "back-end/log/app.log" file.
```sh
# Keep printing the log files when updated
tail -f ../log/uwsgi.log
tail -f ../log/app.log
```
Create a service on Ubuntu, so that the uwsgi server will start automatically after rebooting the system. Replace [PATH] with the path to the cloned repository. Replace [USERNAME] with your user name on Ubuntu.
```sh
sudo vim /etc/systemd/system/video-labeling-tool.service
# Add the following line to this file
[Unit]
Description=uWSGI instance to serve video-labeling-tool
After=network.target

[Service]
User=[USERNAME]
Group=www-data
WorkingDirectory=/[PATH]/video-labeling-tool/back-end/www
Environment="PATH=/home/[USERNAME]/.conda/envs/video-labeling-tool/bin"
ExecStart=/home/[USERNAME]/.conda/envs/video-labeling-tool/bin/uwsgi --ini uwsgi.ini

[Install]
WantedBy=multi-user.target
```
Register the uwsgi server as a service on Ubuntu.
```sh
sudo systemctl enable video-labeling-tool
sudo systemctl start video-labeling-tool

# Check the status of the service
sudo systemctl status video-labeling-tool

# Restart the service
sudo systemctl restart video-labeling-tool

# Stop and disable the service
sudo systemctl disable video-labeling-tool
sudo systemctl stop video-labeling-tool
```
Check if the service work.
```sh
curl localhost:8080
# Should get the "Hello World!" message
```

# Connect uwsgi to apache
Obtain domains from providers such as [Google Domains](https://domains.google/) or [Namecheap](https://www.namecheap.com/) for both the back-end and the front-end. Point these domain names to the domain of the Ubuntu machine. Then install apache2 and enable mods.
```sh
sudo apt-get install apache2
sudo apt-get install apache2-dev

sudo a2enmod headers
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_balancer
sudo a2enmod lbmethod_byrequests
```
Create an apache virtual host as a reverse proxy for the uwsgi server. Replace [BACK_END_DOMAIN] and [FRONT_END_DOMAIN] with your domain name for the back-end and the front-end respectively.
```sh
sudo vim /etc/apache2/sites-available/[BACK_END_DOMAIN].conf
# Add the following lines to this file
<VirtualHost *:80>
  ServerName [BACK_END_DOMAIN]
  Header always set Access-Control-Allow-Origin "[FRONT_END_DOMAIN]"
  Header set Access-Control-Allow-Headers "Content-Type"
  Header set Cache-Control "max-age=60, public, must-revalidate"
  ProxyPreserveHost On
  ProxyRequests Off
  ProxyVia Off
  ProxyPass / http://127.0.0.1:8080/
  ProxyPassReverse / http://127.0.0.1:8080/
  ErrorLog ${APACHE_LOG_DIR}/[BACK_END_DOMAIN].error.log
  CustomLog ${APACHE_LOG_DIR}/[BACK_END_DOMAIN].access.log combined
</VirtualHost>
```
Create a symlink of the virtual host and restart apache.
```sh
cd /etc/apache2/sites-enabled/
sudo ln -s ../sites-available/[BACK_END_DOMAIN].conf
sudo systemctl restart apache2
```

# Setup front-end on apache
Create an apache virtual host. Replace [FRONT_END_DOMAIN] with your domain name for the front-end. Replace [PATH] with the path to the cloned repository.
```sh
sudo vim /etc/apache2/sites-available/[FRONT_END_DOMAIN].conf
# Add the following lines to this file
<VirtualHost *:80>
  ServerName [FRONT_END_DOMAIN]
  DocumentRoot /[PATH]/video-labeling-tool/front-end
  Header always set Access-Control-Allow-Origin "*"
  Header set Cache-Control "max-age=60, public, must-revalidate"
  <Directory "/[PATH]/video-labeling-tool/front-end">
    Options FollowSymLinks
    AllowOverride None
    Require all granted
  </Directory>
  ErrorLog ${APACHE_LOG_DIR}/[FRONT_END_DOMAIN].error.log
  CustomLog ${APACHE_LOG_DIR}/[FRONT_END_DOMAIN].access.log combined
</VirtualHost>
```
Create a symlink of the virtual host and restart apache.
```sh
cd /etc/apache2/sites-enabled/
sudo ln -s ../sites-available/[FRONT_END_DOMAIN].conf
sudo systemctl restart apache2
```