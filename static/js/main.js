(function ()
{
	"use strict";

	var map1Data = [];
	var map1Canvas;
	var map2Data = [];
	var map2Canvas;
	var map1Index = 0;
	var map1LastCalculatedIndex = -1;
	var map2Index = 0;
	var map2LastCalculatedIndex = -1;
	var map1ChangeTimer;
	var map1ChangeTimerResetTimer;
	var map2ChangeTimer;
	var map2ChangeTimerResetTimer;
	var map1ChangeInterval = 400;
	var map2ChangeInterval = 400;
	var mapsTransitionDelay = 2000;
	var mapsChangeTimerResetDelay = 500;
	var mapsUpdateDataInterval = 30000;
	var mapsWidth = 700;
	var mapsHeight = 595;
	var map1IgnoreMouseMove = false;
	var map2IgnoreMouseMove = false;
	var map1IgnoreTransitionDelay = false;
	var map2IgnoreTransitionDelay = false;
	var map2TypeChangeIndex = 8;

	function setMap1(index)
	{
		if (map1Data[index] !== undefined)
		{
			map1Canvas.drawImage(map1Data[index].image, 0, 0, mapsWidth, mapsHeight);
			$("#map1_info_date").html(map1Data[index].dateText);
			$("#map1_info_time").html(map1Data[index].timeText);
			$("#map1_info_index").html((index + 1) + "/" + map1Data.length);
		}
	}

	function setMap2(index)
	{
		if (map2Data[index] !== undefined)
		{
			map2Canvas.drawImage(map2Data[index].image, 0, 0, mapsWidth, mapsHeight);
			$("#map2_info_date").html(map2Data[index].dateText);
			$("#map2_info_time").html(map2Data[index].timeText + (index >= map2TypeChangeIndex ? "*" : ""));
			$("#map2_info_index").html((index + 1) + "/" + map2Data.length);
		}
	}

	function calculateAndSetMap1Index(offset, width)
	{
		var index = Math.floor((offset / width) * map1Data.length);

		if (index !== map1LastCalculatedIndex)
		{
			setMap1(index);
			map1Index = index;
			map1LastCalculatedIndex = index;
		}
	}

	function calculateAndSetMap2Index(offset, width)
	{
		var index = Math.floor((offset / width) * map2Data.length);

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

	$("#map1_inner_container").mousemove(function (event)
	{
		if (map1IgnoreMouseMove)
		{
			map1IgnoreMouseMove = false;
			return;
		}

		calculateAndSetMap1Index((event.pageX - $(this).offset().left), $(this).outerWidth());
	});

	$("#map2_inner_container").mousemove(function (event)
	{
		if (map2IgnoreMouseMove)
		{
			map2IgnoreMouseMove = false;
			return;
		}

		calculateAndSetMap2Index((event.pageX - $(this).offset().left), $(this).outerWidth());
	});

	$("#map1_inner_container")
		.mouseenter(stopMap1ChangeTimer)
		.mouseleave(function ()
		{
			map1LastCalculatedIndex = -1;
			restartMap1ChangeTimer(mapsChangeTimerResetDelay);
			map1IgnoreTransitionDelay = true;
		})
		.click(function ()
		{
			map1IgnoreMouseMove = true;
			stopMap1ChangeTimer();

			if (++map1Index >= map1Data.length)
				map1Index = 0;

			setMap1(map1Index);
		});

	$("#map2_inner_container")
		.mouseenter(stopMap2ChangeTimer)
		.mouseleave(function ()
		{
			map2LastCalculatedIndex = -1;
			restartMap2ChangeTimer(mapsChangeTimerResetDelay);
			map2IgnoreTransitionDelay = true;
		})
		.click(function ()
		{
			map2IgnoreMouseMove = true;
			stopMap2ChangeTimer();

			if (++map2Index >= map2Data.length)
				map2Index = 0;

			setMap2(map2Index);
		});

	$("header h1").dblclick(function ()
	{
		updateMapsDataTimerEvent();
	});

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
		setMap2(map2Index++);

		if (map2Index === map2TypeChangeIndex && !map2IgnoreTransitionDelay)
		{
			stopMap2ChangeTimer();
			restartMap2ChangeTimer(mapsTransitionDelay);
		}

		if (map2Index >= map2Data.length)
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

		updateMapData("get/testbed", map1Data, function ()
		{
			$("#map1_loader_container").fadeOut("slow");
		});

		updateMapData("get/iltasanomat", map2Data, function ()
		{
			$("#map2_loader_container").fadeOut("slow");
		});
	}

	function updateMapData(url, targetData, readyCallback)
	{
		$.getJSON(url, function (data)
		{
			var imagesLeft = data.length;

			var imageLoaded = function ()
			{
				if (--imagesLeft === 0)
				{
					targetData.length = 0;
					Array.prototype.push.apply(targetData, data);

					if (typeof readyCallback === "function")
						readyCallback();
				}
			};

			for (var i in data)
			{
				if (!data.hasOwnProperty(i))
					continue;

				var date = new Date(data[i].dateTime);

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
		$("#map1_canvas_container, #map1_info_container, #map2_canvas_container, #map2_info_container").hide();

		map1Canvas = $("#map1_canvas_container canvas")[0].getContext("2d");
		map2Canvas = $("#map2_canvas_container canvas")[0].getContext("2d");

		var cl = new CanvasLoader("map1_loader");
		cl.setColor("#000000");
		cl.setShape("spiral");
		cl.setDiameter(40);
		cl.show();

		cl = new CanvasLoader("map2_loader");
		cl.setColor("#000000");
		cl.setShape("spiral");
		cl.setDiameter(40);
		cl.show();

		updateMapData("get/testbed", map1Data, function ()
		{
			setMap1(map1Index++);
			map1ChangeTimer = $.timer(map1ChangeInterval, map1ChangeTimerEvent);
			$("#map1_canvas_container, #map1_info_container").fadeIn("slow");
			$("#map1_loader_container").fadeOut("slow");

			updateMapData("get/iltasanomat", map2Data, function ()
			{
				setMap2(map2Index++);
				map2ChangeTimer = $.timer(map2ChangeInterval, map2ChangeTimerEvent);
				$("#map2_canvas_container, #map2_info_container").fadeIn("slow");
				$("#map2_loader_container").fadeOut("slow");
			});
		});

		$.timer(mapsUpdateDataInterval, updateMapsDataTimerEvent);
	});
})();
