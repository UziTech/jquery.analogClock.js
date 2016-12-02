/**
 * jquery.analogClock.js
 * Author: Tony Brix https://tony.brix.ninja
 * License: MIT
 */
;
(function ($) {
	$.fn.analogClock = function (options) {
		if (typeof options === "string") {
			return this.each(function () {
				var $this = $(this);
				if ($this.hasClass("analog-clock")) {
					switch (options) {
						case "disable":
							clearTimer($this);
							break;
						case "enable":
							startTimer($this);
							break;
						default:
							// do nothing
					}
				}
			});
		}
		var defaults = {
			width: 300,
			backgroundColor: "#ccc",
			borderColor: "#666",
			borderWidth: 3,
			numberColor: "#ff0",
			numberSize: 30,
			numberPadding: 6,
			showSecond: true,
			smoothSecond: true,
			secondColor: "#f00",
			secondWidth: 4,
			showMinute: true,
			minuteColor: "#0f0",
			minuteWidth: 6,
			hourColor: "#00f",
			hourWidth: 6,
			showDigital: true,
			digitalColor: "#333"
		};
		return this.each(function () {
			var $this = $(this);
			options = $.extend({}, defaults, options);

			$this
				.html("")
				.data({ options: options })
				.addClass("analog-clock")
				.css({
					position: "relative",
					width: options.width,
					height: options.width,
					fontSize: options.numberSize,
					borderWidth: options.borderWidth,
					borderColor: options.borderColor,
					borderStyle: "solid",
					borderRadius: "50%",
					backgroundColor: options.backgroundColor
				});

			clearTimer($this);

			var radius = options.width / 2;

			// setup numbers
			var $nums = {};
			for (var n = 1; n <= 12; n++) {
				var radians = (n - 3) * Math.PI / 6;
				$nums[n] = $("<div />")
					.addClass("analog-clock-number-" + n)
					.text(n)
					.css({
						position: "absolute",
						width: "1em",
						height: "1em",
						textAlign: "center",
						lineHeight: "1em",
						color: options.numberColor,
						top: radius - (options.numberSize / 2) + (Math.sin(radians) * (radius - options.numberPadding - (options.numberSize / 2))),
						left: radius - (options.numberSize / 2) + (Math.cos(radians) * (radius - options.numberPadding - (options.numberSize / 2)))
					});
				$this.append($nums[n]);
			}

			// setup hour hand
			var hourLength = (radius * .5) + (options.hourWidth / 2);
			var $hour = $("<div />")
				.addClass("analog-clock-hour-hand")
				.css({
					position: "absolute",
					width: options.hourWidth,
					height: hourLength,
					backgroundColor: options.hourColor,
					top: radius - hourLength + (options.hourWidth / 2),
					left: radius - (options.hourWidth / 2),
					transformOrigin: "center " + (hourLength - (options.hourWidth / 2)) + "px 0px",
					borderRadius: options.hourWidth / 2,
					willChange: "transform"
				});
			$this.append($hour);

			// setup minute hand
			var minuteLength = (radius * .7) + (options.minuteWidth / 2);
			var $minute = $("<div />")
				.addClass("analog-clock-minute-hand")
				.css({
					display: (!options.showMinute ? "none" : ""),
					position: "absolute",
					width: options.minuteWidth,
					height: minuteLength,
					backgroundColor: options.minuteColor,
					top: radius - minuteLength + (options.minuteWidth / 2),
					left: radius - (options.minuteWidth / 2),
					transformOrigin: "center " + (minuteLength - (options.minuteWidth / 2)) + "px 0px",
					borderRadius: options.minuteWidth / 2,
					willChange: "transform"
				});
			$this.append($minute);

			// setup second hand
			var secondLength = (radius * .9) + (options.secondWidth / 2);
			var $second = $("<div />")
				.addClass("analog-clock-second-hand")
				.css({
					display: (!options.showSecond ? "none" : ""),
					position: "absolute",
					width: options.secondWidth,
					height: secondLength,
					backgroundColor: options.secondColor,
					top: radius - secondLength + (options.secondWidth / 2),
					left: radius - (options.secondWidth / 2),
					transformOrigin: "center " + (secondLength - (options.secondWidth / 2)) + "px 0px",
					borderRadius: options.secondWidth / 2,
					willChange: "transform"
				});
			$this.append($second);

			var $digital = $("<div />")
				.addClass("analog-clock-digital")
				.css({
					display: (!options.showDigital ? "none" : ""),
					position: "absolute",
					width: "100%",
					height: "1em",
					lineHeight: "1em",
					top: "calc(" + radius + "px - 1.5em)",
					left: 0,
					textAlign: "center",
					fontFamily: "monospace",
					color: options.digitalColor,
					fontWeight: "bold",
					textShadow: textShadow(1, options.backgroundColor)
				});
			$this.append($digital);

			// set initial time
			updateClock($this);

			// start timer
			startTimer($this);
		});
	};

	function textShadow(width, color) {
		var textShadows = [];
		for (var i = -width; i <= width; i++) {
			for (var j = -width; j <= width; j++) {
				var distance = i * i + j * j;
				if (distance > 0 && distance <= width * width) {
					textShadows.push(i + "px " + j + "px 0 " + color);
				}
			}
		}
		return textShadows.join(", ");
	}

	function startTimer($this) {
		var options = $this.data().options;

		if (options.showSecond && options.smoothSecond) {
			$this.data({
				interval: setInterval(function () {
					updateClock($this);
				}, 16)
			});
		} else {
			// start interval at ~10ms
			$this.data({
				interval: setTimeout(function () {
					$this.data({
						interval: setInterval(function () {
							updateClock($this);
						}, 1000)
					});
					updateClock($this);
				}, 1010 - (new Date()).getMilliseconds())
			});
		}
		updateClock($this);
	}

	function clearTimer($this) {
		if ($this.data().interval) {
			clearInterval($this.data().interval);
			$this.data({ interval: 0 });
		}
	}

	function updateClock($this) {
		var options = $this.data().options;

		var d = new Date();
		var milliseconds = (options.smoothSecond ? d.getMilliseconds() : 0);
		var seconds = d.getSeconds() + (milliseconds / 1000);
		var minutes = d.getMinutes() + (seconds / 60);
		var hours = (d.getHours() % 12) + (minutes / 60);

		var seperator = ":";
		var digital = (hours < 1 ? 12 : Math.floor(hours)) + seperator;
		digital += (Math.floor(minutes) < 10 ? "0" : "") + Math.floor(minutes) + seperator;
		digital += (Math.floor(seconds) < 10 ? "0" : "") + Math.floor(seconds);

		$this.find(".analog-clock-second-hand").css({ transform: "rotateZ(" + (seconds * 6) + "deg)" });
		$this.find(".analog-clock-minute-hand").css({ transform: "rotateZ(" + (minutes * 6) + "deg)" });
		$this.find(".analog-clock-hour-hand").css({ transform: "rotateZ(" + (hours * 30) + "deg)" });
		$this.find(".analog-clock-digital").text(digital);
	}
})(jQuery);
