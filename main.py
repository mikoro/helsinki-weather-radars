# Copyright (C) 2014 Mikko Ronkainen <firstname@mikkoronkainen.com>
# License: MIT, see the LICENSE file.

import webapp2

import handlers

routes = [
    ("/", handlers.IndexHandler),
    ("/get/1", handlers.GetTestbedDataHandler),
    ("/get/2", handlers.GetIltasanomatDataHandler)
]

app = webapp2.WSGIApplication(routes, debug=True)

if __name__ == "__main__":
    app.run()
