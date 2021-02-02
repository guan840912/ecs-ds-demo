# -*- coding: utf-8 -*-
import os
from flask import Flask
import urllib.request
import json
cwd = os.getcwd()
URL=os.getenv('URL', '0.0.0.0')
MOCKDATA_SERVER=os.getenv('MOCKDATA_SERVER', 'http://localhost:8081')
app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index_page():
  with urllib.request.urlopen(MOCKDATA_SERVER) as response:
    html = response.read()
  
  api = {'apiServer':'I am api server and I will call mockdata server via http'}
  api.update(json.loads(html))
  return api

@app.route('/healthcheck', methods=['GET', 'POST'])
def hc():
  return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host=URL,port=8080)