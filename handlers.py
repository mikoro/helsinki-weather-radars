import json
import os
import urllib2
import webapp2

from google.appengine.ext import db
from google.appengine.api import memcache
from google.appengine.api import urlfetch

from iltasanomat_parser import iltasanomat_parse
from testbed_parser import testbed_parse

class TestbedDataEntity(db.Model):
	data = db.TextProperty()


class IltasanomatDataEntity(db.Model):
	data = db.TextProperty()


class IndexHandler(webapp2.RequestHandler):
	def get(self):
		self.response.headers["X-UA-Compatible"] = "IE=edge,chrome=1"
		self.response.write(open(os.path.dirname(__file__) + "/static/index.html").read())


class GetTestbedDataHandler(webapp2.RequestHandler):
	def get(self):
		testbed_data = memcache.get("testbed")

		if testbed_data is None:
			testbed_data = TestbedDataEntity.get_by_key_name("testbed").data
			memcache.set("testbed", testbed_data, 180)

		self.response.headers["Content-Type"] = "application/json; charset=utf-8"
		self.response.write(testbed_data)


class GetIltasanomatDataHandler(webapp2.RequestHandler):
	def get(self):
		iltasanomat_data = memcache.get("iltasanomat")

		if iltasanomat_data is None:
			iltasanomat_data = IltasanomatDataEntity.get_by_key_name("iltasanomat").data
			memcache.set("iltasanomat", iltasanomat_data, 180)

		self.response.headers["Content-Type"] = "application/json; charset=utf-8"
		self.response.write(iltasanomat_data)


class UpdateAllDataHandler(webapp2.RequestHandler):
	def get(self):
		testbed_data = json.dumps(obj=testbed_parse(), indent=1)
		iltasanomat_data = json.dumps(obj=iltasanomat_parse(), indent=1)

		TestbedDataEntity(key_name="testbed", data=testbed_data).put()
		IltasanomatDataEntity(key_name="iltasanomat", data=iltasanomat_data).put()

		memcache.set("testbed", testbed_data, 180)
		memcache.set("iltasanomat", iltasanomat_data, 180)

		self.response.status = 204


class PrintTestbedDataHandler1(webapp2.RequestHandler):
	def get(self):
		request = urllib2.Request("http://testbed.fmi.fi/history_browser.php?imgtype=radar&t=5&n=15", None,
				{"Cache-Control": "no-cache,max-age=0"})
		response = urllib2.urlopen(request).read()

		self.response.headers["Content-Type"] = "text/plain; charset=utf-8"
		self.response.status = 200
		self.response.write(response)


class PrintTestbedDataHandler2(webapp2.RequestHandler):
	def get(self):
		response = urlfetch.fetch(url="http://testbed.fmi.fi/history_browser.php?imgtype=radar&t=5&n=15", method="GET",
		                          deadline=30,
		                          headers={"User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:11.0) Gecko/20100101 Firefox/11.0",
		                                   "Cache-Control": "no-cache,max-age=0"}).content

		self.response.headers["Content-Type"] = "text/plain; charset=utf-8"
		self.response.status = 200
		self.response.write(response)
