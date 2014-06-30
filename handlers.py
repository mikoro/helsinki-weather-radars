import json
import os

import webapp2
from google.appengine.api import memcache

from parsers import iltasanomat_parser
from parsers import testbed_parser


class IndexHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers["X-UA-Compatible"] = "IE=edge,chrome=1"
        self.response.write(open(os.path.dirname(__file__) + "/static/index.html").read())


class GetTestbedDataHandler(webapp2.RequestHandler):
    def get(self):
        testbed_data = memcache.get("testbed")

        if testbed_data is None:
            testbed_data = json.dumps(obj=testbed_parser.get_and_parse(self.request.headers.get("User-Agent")), indent=1)
            memcache.set("testbed", testbed_data, 120)

        self.response.headers["Content-Type"] = "application/json"
        self.response.write(testbed_data)


class GetIltasanomatDataHandler(webapp2.RequestHandler):
    def get(self):
        iltasanomat_data = memcache.get("iltasanomat")

        if iltasanomat_data is None:
            iltasanomat_data = json.dumps(obj=iltasanomat_parser.get_and_parse(self.request.headers.get("User-Agent")), indent=1)
            memcache.set("iltasanomat", iltasanomat_data, 120)

        self.response.headers["Content-Type"] = "application/json"
        self.response.write(iltasanomat_data)
