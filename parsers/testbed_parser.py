# Copyright (C) 2014 Mikko Ronkainen <firstname@mikkoronkainen.com>
# License: MIT, see the LICENSE file.

import binascii
import json
import os
import urllib.request

from datetime import datetime


def get_and_parse(user_agent):
    request = urllib.request.Request("http://testbed.fmi.fi/history_browser.php?imgtype=radar&t=5&n=15",
                                     None,
                                     {"Cache-Control": "no-cache,max-age=0",
                                      "User-Agent": user_agent + binascii.b2a_hex(os.urandom(4)).decode()})

    response = urllib.request.urlopen(request).read().decode()

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
    result = get_and_parse("None")
    print(json.dumps(obj=result, indent=1))
