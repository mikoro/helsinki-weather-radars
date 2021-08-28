# Copyright (C) 2021 Mikko Ronkainen <firstname@mikkoronkainen.com>
# License: MIT, see the LICENSE file.

import binascii
import json
import os
import urllib.request

from datetime import datetime


def get_and_parse(user_agent):
    request = urllib.request.Request(
        "http://cdn.fmi.fi/apps/list-finland-radar-images/index.php?product-id=etela-suomi&flash=true",
        None,
        {"Cache-Control": "no-cache,max-age=0", "User-Agent": user_agent + binascii.b2a_hex(os.urandom(4)).decode()})

    response = json.loads(urllib.request.urlopen(request).read().decode())

    result2 = []

    for i in response["images"]:
        time = datetime.fromtimestamp(int(i["epoch"]) / 1000)
        time = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        result2.append({"dateTime": time, "imageUrl": i["url"]})

    return result2


if __name__ == "__main__":
    result = get_and_parse("None")
    print(json.dumps(obj=result, indent=1))
