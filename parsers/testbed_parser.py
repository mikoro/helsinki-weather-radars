# Copyright (C) 2014 Mikko Ronkainen <firstname@mikkoronkainen.com>
# License: MIT, see the LICENSE file.

import json
import urllib2

from datetime import datetime


def get_and_parse(user_agent):
    """
    Load the website and extract time and image information into an array.
    """
    request = urllib2.Request("http://testbed.fmi.fi/history_browser.php?imgtype=radar&t=5&n=15", None, {"Cache-Control": "no-cache,max-age=0", "User-Agent": "dbd4d91e"})
    response = urllib2.urlopen(request).read()

    timestamps_start = response.find("var anim_timestamps = new Array(")
    timestamps_end = response.find("\");", timestamps_start)
    timestamps = response[timestamps_start + 33: timestamps_end]
    timestamps = timestamps.split("\",\"")
    timestamps = [datetime.strptime(timestamp, "%Y%m%d%H%M").strftime("%Y-%m-%dT%H:%M:%SZ") for timestamp in timestamps]

    images_start = response.find("var anim_images_anim_anim = new Array(")
    images_end = response.find("\");", images_start)
    images = response[images_start + 39: images_end]
    images = images.split("\",\"")

    result = []

    for t in zip(timestamps, images):
        result.append({"dateTime": t[0], "imageUrl": t[1]})

    return result


if __name__ == "__main__":
    result = get_and_parse("")
    print(json.dumps(obj=result, indent=1))
