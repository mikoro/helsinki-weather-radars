# Copyright (C) 2021 Mikko Ronkainen <firstname@mikkoronkainen.com>
# License: MIT, see the LICENSE file.

import json

from flask import Flask
from flask import request

from parsers import ilmatieteenlaitos_parser
from parsers import testbed_parser

app = Flask(__name__)


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/get/1")
def get1():
    return json.dumps(obj=testbed_parser.get_and_parse(request.headers.get("User-Agent")), indent=1)


@app.route("/get/2")
def get2():
    return json.dumps(obj=ilmatieteenlaitos_parser.get_and_parse(request.headers.get("User-Agent")), indent=1)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
