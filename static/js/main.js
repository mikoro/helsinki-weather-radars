// Copyright (C) 2021 Mikko Ronkainen <firstname@mikkoronkainen.com>
// License: MIT, see the LICENSE file.

(function ()
{
	"use strict";

	let map1Data = [];
	let map1Canvas;
	let map2Data = [];
	let map2Canvas;
	let map1Index = 0;
	let map1LastCalculatedIndex = -1;
	let map2Index = 0;
	let map2LastCalculatedIndex = -1;
	let map1ChangeTimer;
	let map1ChangeTimerResetTimer;
	let map2ChangeTimer;
	let map2ChangeTimerResetTimer;
	let map1ChangeInterval = 400;
	let map2ChangeInterval = 400;
	let mapsTransitionDelay = 2000;
	let mapsChangeTimerResetDelay = 500;
	let mapsUpdateDataInterval = 300000;
	let mapsWidth = 700;
	let mapsHeight = 595;
	let map1IgnoreTransitionDelay = false;
	let map2IgnoreTransitionDelay = false;
	let map1TopLat = 61.017239;
	let map1BottomLat = 59.314766;
	let map1LeftLong = 22.749985;
	let map1RightLong = 26.731884;
	let map2TopLat = 63.841367;
	let map2BottomLat = 58.149336;
	let map2LeftLong = 19.178697;
	let map2RightLong = 31.305304;
	let map1ShowLocation = false;
	let map2ShowLocation = false;
	let map1LocationX = 0;
	let map1LocationY = 0;
	let map2LocationX = 0;
	let map2LocationY = 0;

	function drawLocation(canvas, x, y)
	{
		canvas.beginPath();
		canvas.arc(x, y, 4, 0, 2 * Math.PI, false);
		canvas.fillStyle = "rgba(255, 0, 0, 1.0)";
		canvas.fill();
		canvas.lineWidth = 1;
		canvas.strokeStyle = "rgba(0, 0, 0, 1.0)";
		canvas.stroke();
	}

	function setMap1(index)
	{
		if (map1Data[index] !== undefined)
		{
			map1Canvas.drawImage(map1Data[index].image, 0, 0, mapsWidth, mapsHeight);

			if (map1ShowLocation)
				drawLocation(map1Canvas, map1LocationX, map1LocationY);

			map1Canvas.font = "bold 25px Open Sans";
			map1Canvas.fillStyle = "red";
			map1Canvas.fillText(map1Data[index].timeText, mapsWidth - 75, 27);
		}
	}

	function setMap2(index)
	{
		if (map2Data[index] !== undefined)
		{
			map2Canvas.drawImage(map2Data[index].image, 0, 0, mapsWidth, mapsHeight);

			if (map2ShowLocation)
				drawLocation(map2Canvas, map2LocationX, map2LocationY);

			map2Canvas.font = "bold 25px Open Sans";
			map2Canvas.fillStyle = "red";
			map2Canvas.fillText(map2Data[index].timeText, mapsWidth - 75, 27);
		}
	}

	function calculateAndSetMap1Index(offset, width)
	{
		let index = Math.floor((offset / width) * map1Data.length);

		if (index !== map1LastCalculatedIndex)
		{
			setMap1(index);
			map1Index = index;
			map1LastCalculatedIndex = index;
		}
	}

	function calculateAndSetMap2Index(offset, width)
	{
		let index = Math.floor((offset / width) * map2Data.length);

		if (index !== map2LastCalculatedIndex)
		{
			setMap2(index);
			map2Index = index;
			map2LastCalculatedIndex = index;
		}
	}

	function stopMap1ChangeTimer()
	{
		if (map1ChangeTimerResetTimer !== undefined)
			map1ChangeTimerResetTimer.stop();

		if (map1ChangeTimer !== undefined)
			map1ChangeTimer.stop();
	}

	function stopMap2ChangeTimer()
	{
		if (map2ChangeTimerResetTimer !== undefined)
			map2ChangeTimerResetTimer.stop();

		if (map2ChangeTimer !== undefined)
			map2ChangeTimer.stop();
	}

	function restartMap1ChangeTimer(waitTime)
	{
		map1ChangeTimerResetTimer = $.timer(waitTime, function ()
		{
			if (map1ChangeTimer !== undefined)
				map1ChangeTimer.reset(map1ChangeInterval);

			map1ChangeTimerResetTimer.stop();
		});
	}

	function restartMap2ChangeTimer(waitTime)
	{
		map2ChangeTimerResetTimer = $.timer(waitTime, function ()
		{
			if (map2ChangeTimer !== undefined)
				map2ChangeTimer.reset(map2ChangeInterval);

			map2ChangeTimerResetTimer.stop();
		});
	}

	$("#map1_inner_container")
		.mouseenter(stopMap1ChangeTimer)
		.mousemove(function (event)
		{
			calculateAndSetMap1Index((event.pageX - $(this).offset().left), $(this).outerWidth());
		})
		.mouseleave(function ()
		{
			map1LastCalculatedIndex = -1;
			restartMap1ChangeTimer(mapsChangeTimerResetDelay);
			map1IgnoreTransitionDelay = true;
		});

	$("#map2_inner_container")
		.mouseenter(stopMap2ChangeTimer)
		.mousemove(function (event)
		{
			calculateAndSetMap2Index((event.pageX - $(this).offset().left), $(this).outerWidth());
		})
		.mouseleave(function ()
		{
			map2LastCalculatedIndex = -1;
			restartMap2ChangeTimer(mapsChangeTimerResetDelay);
			map2IgnoreTransitionDelay = true;
		});

	function handleTouchstart1() {
		stopMap1ChangeTimer();
	}

	function handleTouchmove1(evt) {
		let touches = evt.targetTouches;

		if (touches.length >= 1)
		{
			calculateAndSetMap1Index((touches[0].pageX - $("#map1_inner_container").offset().left), $("#map1_inner_container").outerWidth());
		}
	}

	function handleTouchend1() {
		map1LastCalculatedIndex = -1;
		restartMap1ChangeTimer(mapsChangeTimerResetDelay);
		map1IgnoreTransitionDelay = true;
	}

	function handleTouchstart2() {
		stopMap2ChangeTimer();
	}

	function handleTouchmove2(evt) {
		let touches = evt.targetTouches;

		if (touches.length >= 1)
		{
			calculateAndSetMap2Index((touches[0].pageX - $("#map2_inner_container").offset().left), $("#map2_inner_container").outerWidth());
		}
	}

	function handleTouchend2() {
		map2LastCalculatedIndex = -1;
		restartMap2ChangeTimer(mapsChangeTimerResetDelay);
		map2IgnoreTransitionDelay = true;
	}

	function map1ChangeTimerEvent()
	{
		setMap1(map1Index);

		if (++map1Index >= map1Data.length)
		{
			map1Index = 0;

			if (!map1IgnoreTransitionDelay)
			{
				stopMap1ChangeTimer();
				restartMap1ChangeTimer(mapsTransitionDelay);
			}
		}

		map1IgnoreTransitionDelay = false;
	}

	function map2ChangeTimerEvent()
	{
		setMap2(map2Index);

		if (++map2Index >= map2Data.length)
		{
			map2Index = 0;

			if (!map2IgnoreTransitionDelay)
			{
				stopMap2ChangeTimer();
				restartMap2ChangeTimer(mapsTransitionDelay);
			}
		}

		map2IgnoreTransitionDelay = false;
	}

	function updateMapsDataTimerEvent()
	{
		$("#map1_loader_container, #map2_loader_container").fadeIn("slow");

		updateMapData("get/1", map1Data, function ()
		{
			$("#map1_loader_container").fadeOut("slow");
		});

		updateMapData("get/2", map2Data, function ()
		{
			$("#map2_loader_container").fadeOut("slow");
		});
	}

	function updateMapData(url, targetData, readyCallback)
	{
		$.getJSON(url, function (data)
		{
			let imagesLeft = data.length;

			let imageLoaded = function ()
			{
				if (--imagesLeft === 0)
				{
					targetData.length = 0;
					Array.prototype.push.apply(targetData, data);

					if (typeof readyCallback === "function")
						readyCallback();
				}
			};

			for (let i in data)
			{
				if (!data.hasOwnProperty(i))
					continue;

				let date = new Date(data[i].dateTime);

				data[i].image = new Image();
				data[i].dateText = date.format("dd.mm");
				data[i].timeText = date.format("HH:MM");
				data[i].image.onload = imageLoaded;

				data[i].image.onerror = function ()
				{
					this.src = "img/error.png";
				};

				data[i].image.src = data[i].imageUrl;
			}
		});
	}

	$(function ()
	{
		$("#map1_canvas_container canvas, #map2_canvas_container canvas").attr({ width: mapsWidth, height: mapsHeight });
		$("#map1_canvas_container, #map2_canvas_container").hide();

		map1Canvas = $("#map1_canvas_container canvas")[0].getContext("2d");
		map2Canvas = $("#map2_canvas_container canvas")[0].getContext("2d");

		let canvas1 = document.getElementById("canvas1");
		canvas1.addEventListener("touchstart", handleTouchstart1, false);
		canvas1.addEventListener("touchmove", handleTouchmove1, false);
		canvas1.addEventListener("touchend", handleTouchend1, false);
		canvas1.addEventListener("touchcancel", handleTouchend1, false);

		let canvas2 = document.getElementById("canvas2");
		canvas2.addEventListener("touchstart", handleTouchstart2, false);
		canvas2.addEventListener("touchmove", handleTouchmove2, false);
		canvas2.addEventListener("touchend", handleTouchend2, false);
		canvas2.addEventListener("touchcancel", handleTouchend2, false);

		let cl = new CanvasLoader("map1_loader");
		cl.setColor("#000000");
		cl.setShape("spiral");
		cl.setDiameter(40);
		cl.show();

		cl = new CanvasLoader("map2_loader");
		cl.setColor("#000000");
		cl.setShape("spiral");
		cl.setDiameter(40);
		cl.show();

		updateMapData("get/1", map1Data, function ()
		{
			setMap1(map1Index++);
			map1ChangeTimer = $.timer(map1ChangeInterval, map1ChangeTimerEvent);
			$("#map1_canvas_container").fadeIn("slow");
			$("#map1_loader_container").fadeOut("slow");
		});

		updateMapData("get/2", map2Data, function ()
		{
			setMap2(map2Index++);
			map2ChangeTimer = $.timer(map2ChangeInterval, map2ChangeTimerEvent);
			$("#map2_canvas_container").fadeIn("slow");
			$("#map2_loader_container").fadeOut("slow");
		});

		$.timer(mapsUpdateDataInterval, updateMapsDataTimerEvent);

		if (Modernizr.geolocation)
		{
			navigator.geolocation.watchPosition(function (position)
			{
				let latitude = position.coords.latitude;
				let longitude = position.coords.longitude;

				if (latitude > map1BottomLat && latitude < map1TopLat && longitude > map1LeftLong && longitude < map1RightLong)
				{
					map1LocationX = Math.round(((longitude - map1LeftLong) / (map1RightLong - map1LeftLong)) * mapsWidth);
					map1LocationY = Math.round(((map1TopLat - latitude) / (map1TopLat - map1BottomLat)) * mapsHeight);
					map1ShowLocation = true;
				}
				else
					map1ShowLocation = false;

				if (latitude > map2BottomLat && latitude < map2TopLat && longitude > map2LeftLong && longitude < map2RightLong)
				{
					map2LocationX = Math.round(((longitude - map2LeftLong) / (map2RightLong - map2LeftLong)) * mapsWidth);
					map2LocationY = Math.round(((map2TopLat - latitude) / (map2TopLat - map2BottomLat)) * mapsHeight);
					map2ShowLocation = true;
				}
				else
					map2ShowLocation = false;
			});
		}
	});
})();
