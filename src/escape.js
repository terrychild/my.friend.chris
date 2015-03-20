(function($) {
	$(function() {
		console.log("ready");

		var maze = (function() {
			// create canvas
			var $canvas = $("<canvas>").appendTo("body");
			var canvas = $canvas.get(0);
			var context = canvas.getContext("2d");

			// settings
			var tileSize = 40;
			var wallWidth = 1;

			var view = {
				width: 0,
				height: 0,
				xoffset: 0, 
				yoffset: 0
			};

			// status
			var status = {
				x: 1,
				y: 1,
				d: 2
			};

			// levels
			var map = {
				width: 20,
				height: 12,
				map: [
					"WWWWWWWWWWWWWWWWWWWW",
					"W                  W",
					"W WWWWWWWWWWWWWWWW W",
					"W W              W W",
					"W W WWWWWWWW WWW W W",
					"W W W          W W W",
					"W   W          W W W",
					"W W WWWWWWWWWWWW W W",
					"W W              W W",
					"W WWWWWWWWWWWWWWWW W",
					"W                  W",
					"WWWWWWWWWWWWWWWWWWWW"
				]
			};

			// load images
			var imagesLoading = 0;

			function loadImage(url) {
				imagesLoading++;

				var image = new Image();
				image.src = url;
				image.onload = function() {
					imagesLoading--;
					if(imagesLoading==0) {
						draw();
					}
				}
				return image;
			}

			var images = {
				" ": loadImage("media/floor.png"),
				"W": loadImage("media/wall.png"),
				"0": loadImage("media/man_up.png"),
				"1": loadImage("media/man_right.png"),
				"2": loadImage("media/man_down.png"),
				"3": loadImage("media/man_left.png")
			}


			// draw
			function draw() {
				console.log("draw");

				if(view.width && view.height && imagesLoading==0) {
					for(y=0; y<map.height; y++) {
						for(x=0; x<map.width; x++) {
							context.drawImage(images[map.map[y].substr(x,1)], x*tileSize+view.xoffset, y*tileSize+view.yoffset);
						}
					}

					context.drawImage(images[status.d], status.x*tileSize+view.xoffset, status.y*tileSize+view.yoffset);
				}				
			}
			
			// resize
			function resize() {
				console.log("resize");
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;

				view.width = Math.floor(canvas.width/tileSize);
				view.height = Math.floor(canvas.height/tileSize);
				view.xoffset = (canvas.width-(view.width*tileSize))/2;
				view.yoffset = (canvas.height-(view.height*tileSize))/2;

				draw();
			}
			resize();
			$(window).on("resize", resize);


			// simulate
			$(document).keydown(function(e) {
				console.log("move");
				var newX = status.x;
				var newY = status.y;

				switch(e.which) {
					case 38: // up
						status.d = 0;
						newY--;
						break;
					case 39: // right
						status.d = 1;
						newX++;
						break;
					case 40: // down
						status.d = 2;
						newY++;
						break;
					case 37: // left
						status.d = 3;
						newX--;
						break;
				}

				if(map.map[newY].substr(newX,1)===" ") {
					status.x=newX;
					status.y=newY;
				}

				draw();
			});

		})();

		// test JQuery
		/*
		$("<div>")
			.appendTo("body")
			.text("Hello, World!")
			.addClass("popup")
			.hide()
			.fadeIn();
		*/
	});
})(jQuery);