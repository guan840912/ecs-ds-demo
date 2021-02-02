# -*- coding: utf-8 -*-
import os
from flask import Flask
import socket
def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

cwd = os.getcwd()
URL=os.getenv('URL', '0.0.0.0')
app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index_page():
    
    return { 'data': 'hello from mock server my ip is {}'.format(get_ip()) }

if __name__ == '__main__':
    app.run(host=URL,port=8080)