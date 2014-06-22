import webapp2, handlers

routes = [
	("/", handlers.IndexHandler),
	("/get/1", handlers.GetTestbedDataHandler),
	("/get/2", handlers.GetIltasanomatDataHandler),
	("/update", handlers.UpdateAllDataHandler),
	("/print/1", handlers.PrintTestbedDataHandler1),
	("/print/2", handlers.PrintTestbedDataHandler2)
]

app = webapp2.WSGIApplication(routes, debug=True)

if __name__ == "__main__":
	app.run()
