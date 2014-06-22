import json
import urllib2

from datetime import datetime

def testbed_parse():
	request = urllib2.Request("http://testbed.fmi.fi/history_browser.php?imgtype=radar&t=5&n=15", None, {"Cache-Control": "no-cache,max-age=0"})
	response = urllib2.urlopen(request).read()

	timestampsStart = response.find("var anim_timestamps = new Array(")
	timestampsEnd = response.find("\");", timestampsStart)
	timestamps = response[timestampsStart + 33: timestampsEnd]
	timestamps = timestamps.split("\",\"")
	timestamps = [datetime.strptime(timestamp, "%Y%m%d%H%M").strftime("%Y-%m-%dT%H:%M:%SZ") for timestamp in timestamps]

	imagesStart = response.find("var anim_images_anim_anim = new Array(")
	imagesEnd = response.find("\");", imagesStart)
	images = response[imagesStart + 39: imagesEnd]
	images = images.split("\",\"")

	result = []

	for t in zip(timestamps, images):
		result.append({"dateTime": t[0], "imageUrl": t[1]})

	return result

if __name__ == "__main__":
	result = testbed_parse()
	print(json.dumps(obj=result, indent=1))
