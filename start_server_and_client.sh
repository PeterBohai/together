#!/bin/bash

####
# Script to start the Django backend server and the React frontend client
####

# -----------------------
#  Start Environment 
# -----------------------

# Make sure ttab is installed globally with npm
npm list -g | grep ttab || npm install -g ttab
# Note, might need to check off Terminal/iTerm in
# System Preferences > Security & Privacy > Privacy > Accessibility

# Mysql is needed for Django's database
brew services start mysql

# Redis is needed for Django Channel (Websocket Django package)
brew services start redis

# -----------------------
#  Start Django Backend 
# -----------------------
ttab -t "Django Server" "
	echo -e '\n\nStarting Django backend....\n\n';
	together; 
	cd together; 
	source ~/.virtualenvs/venv/together/bin/activate;
	python manage.py runserver
"
# -----------------------
#  Start React Frontend 
# -----------------------
echo "Starting React frontend..."
together
cd together-client

echo "$ npm start"
npm start
