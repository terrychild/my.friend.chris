(function($) {
	$(function() {
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

		// status
		var status = {
			x: 1,
			y: 1,
			lastX: 1,
			lastY: 1,
			nextX: 1,
			nextY: 1,
			moving: 0,
			moveStartTime: null,
			facing: 2,
			key: -1
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
					draw(true);
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
		function drawTile(x, y) {
			context.drawImage(images[map.map[y].substr(x,1)], x*tileSize+view.xoffset, y*tileSize+view.yoffset);
		}

		function draw(everything) {
			if(view.width && view.height && imagesLoading==0) {
				// draw map
				if(everything) {
					for(y=0; y<map.height; y++) {
						for(x=0; x<map.width; x++) {
							drawTile(x, y);
						}
					}
				} else {
					drawTile(status.lastX, status.lastY);
					drawTile(status.x, status.y);
					drawTile(status.nextX, status.nextY);
				}

				// draw man
				var partialX = 0;
				var partialY = 0;
				var partialOffset = status.moving*tileSize;
				switch(status.facing) {
					case 0:
						partialY = 0-partialOffset;
						break;
					case 1:
						partialX = 0+partialOffset;
						break;
					case 2:
						partialY = 0+partialOffset;
						break;
					case 3:
						partialX = 0-partialOffset;
						break;	
				}
				context.drawImage(images[status.facing], status.x*tileSize+partialX+view.xoffset, status.y*tileSize+partialY+view.yoffset);
			}				
		}
		
		// resize
		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			view.width = Math.floor(canvas.width/tileSize);
			view.height = Math.floor(canvas.height/tileSize);
			view.xoffset = Math.floor((canvas.width-(view.width*tileSize))/2);
			view.yoffset = Math.floor((canvas.height-(view.height*tileSize))/2);

			draw(true);
		}
		resize();
		$(window).on("resize", resize);


		// simulate
		var timer=null;

		function move(time) {
			if(status.nextX!=status.x || status.nextY!=status.y) {
				status.moving=(time-status.moveStartTime)/150;

				if(status.moving>=1) {
					status.lastX = status.x;
					status.lastY = status.y;
					status.x = status.nextX;
					status.y = status.nextY;

					status.moving = status.moving - Math.floor(status.moving);
				}
			}

			if(status.nextX===status.x && status.nextY===status.y) {
				if(status.key>=0) {
					status.facing = status.key;

					var newX = status.x;
					var newY = status.y;
					
					switch(status.facing) {
						case 0:
							newY--;
							break;
						case 1:
							newX++;
							break;
						case 2:
							newY++;
							break;
						case 3:
							newX--;
							break;
					}

					if(map.map[newY].substr(newX,1)===" ") {
						status.moveStartTime = time;
						status.nextX=newX;
						status.nextY=newY;
					}
				}
			}

			if(status.nextX!=status.x || status.nextY!=status.y) {
				timer = requestAnimationFrame(move);
			} else {
				timer = null;
				status.moving = 0;
			}

			draw(false);
		}

		$(window).on("keydown", function(e) {
			switch(e.which) {
				case 38: // up
					status.key = 0;
					break;
				case 39: // right
					status.key = 1;
					break;
				case 40: // down
					status.key = 2;
					break;
				case 37: // left
					status.key = 3;
					break;
			}
			if(status.key>=0) {
				if(!timer) {
					timer = requestAnimationFrame(move);
				}
			}
		});

		$(window).on("keyup", function(e) {
			switch(e.which) {
				case 38: // up
					if(status.key===0) {
						status.key = -1;	
					}
					break;
				case 39: // right
					if(status.key===1) {
						status.key = -1;	
					}
					break;
				case 40: // down
					if(status.key===2) {
						status.key = -1;	
					}
					break;
				case 37: // left
					if(status.key===3) {
						status.key = -1;	
					}
					break;
			}
		});

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