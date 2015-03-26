(function($) {
	$(function() {
		// --- constants ---
		var NULL=0, WALL=1, FLOOR=2, GRASS=3;

		// --- settings ---
		var tileSize = 40;
		var scrollPoint = 3;

		var view = {
			width: 0,
			height: 0,
			left: 0,
			top: 0,
			xoffset: 0, 
			yoffset: 0
		};

		// --- status ---
		var status = {
			level: null,

			x: null,
			y: null,
			lastX: null,
			lastY: null,
			nextX: null,
			nextY: null,

			moving: 0,
			moveStartTime: null,
			facing: 2,
			key: -1
		};

		// --- helper functions ---
		function toHex(number) {
			var rv = number.toString(16);
			if(rv.length==1) {
				rv = "0"+rv;
			}
			return rv.toUpperCase();
		}

		function isReady() {
			if(context && view.width && view.height && imagesLoading==0 && status.level) {
				return levels.every(function(level) {
					return level.loaded;
				});
			}
			return false;
		}

		// --- images ---
		var imagesLoading = 0;

		function loadImage(url) {
			imagesLoading++;

			var image = new Image();
			image.src = url;
			image.onload = function() {
				imagesLoading--;
				if(imagesLoading==0) {
					scroll(true);
					draw(true);
				}
			}
			return image;
		}

		var images = {};
		images[FLOOR] = loadImage("media/floor.png");
		images[WALL] = loadImage("media/wall.png");
		images[GRASS] = loadImage("media/grass.png");

		var manImages = {
			"0": loadImage("media/man_up.png"),
			"1": loadImage("media/man_right.png"),
			"2": loadImage("media/man_down.png"),
			"3": loadImage("media/man_left.png")
		}

		// --- levels ---
		var levels = [
			{
				loaded: false,
				bitmap: "m00.bmp"
			}
		];

		var mapContext = $("<canvas>").get(0).getContext("2d");
		levels.forEach(function(level, index) {
			var image = new Image();
			image.src = "maps/"+level.bitmap;
			image.onload = function() {
				level.width = image.width;
				level.height = image.height;
				level.map = [];

				mapContext.drawImage(image, 0, 0);
				var data = mapContext.getImageData(0, 0, image.width, image.height).data;
				for(var y=0; y<image.height; y++) {
					var row = [];
					level.map.push(row);

					for(var x=0; x<image.width; x++) {
						var j = ((y*image.width)+x)*4;
						switch(toHex(data[j+0])+toHex(data[j+1])+toHex(data[j+2])) {
							case "808080":
								row.push(WALL);
								break;
							case "8080FF":
								level.startX=x;
								level.startY=y;
							case "0000FF":
								row.push(FLOOR);
								break;
							case "00FF00":
								row.push(GRASS);
								break;
							default:
								row.push(NULL);
						}
						
					}
				}

				level.loaded = true;

				if(index==0) {
					status.level = level;
					status.x = status.lastX = status.nextX = level.startX;
					status.y = status.lastY = status.nextY = level.startY;
				}

				scroll(true);
				draw(true);
			}
		});

		// --- draw ---
		var $canvas = $("<canvas>").appendTo("body");
		var canvas = $canvas.get(0);
		var context = canvas.getContext("2d");

		function drawTile(image, x, y) {
			if(image) {
				context.drawImage(image, (x-view.left)*tileSize+view.xoffset, (y-view.top)*tileSize+view.yoffset);
			}
		}
		function drawMapTile(x, y) {
			drawTile(images[status.level.map[y][x]], x, y);
		}
		function drawManTile() {
			var x = status.x;
			var y = status.y;
			if(isMoving()) {
				switch(status.facing) {
					case 0:
						y -= status.moving;
						break;
					case 1:
						x += status.moving;
						break;
					case 2:
						y += status.moving;
						break;
					case 3:
						x -= status.moving;
						break;	
				}
			}

			drawTile(manImages[status.facing], x, y);
		}
		function draw(everything) {
			if(isReady()) {				
				if(everything) {
					context.clearRect(0, 0, canvas.width, canvas.height);

					for(y=0; y<status.level.height; y++) {
						for(x=0; x<status.level.width; x++) {
							drawMapTile(x, y);
						}
					}
				} else {
					drawMapTile(status.lastX, status.lastY);
					drawMapTile(status.x, status.y);
					drawMapTile(status.nextX, status.nextY);
				}

				drawManTile();
			}				
		}

		// --- scoll ---
		function scroll(instant) {
			if(isReady()) {
				var newLeft=null, 
					newTop=null, 
					doScroll=false;

				// X
				if(status.level.width<=view.width) {
					view.left = Math.floor((view.width-status.level.width)/2);
				} else {
					newLeft = status.x-Math.floor(view.width/2);
					if(instant) {
						view.left = newLeft;
					} else if(newLeft!==view.left) {
						if((status.x<view.left+scrollPoint) || (status.x>view.left+view.width-scrollPoint)) {
							doScroll = true;
						}
					}
				}

				// Y
				if(status.level.height<view.height) {
					view.top = Math.floor((view.height-status.level.height)/2);
				} else {
					newTop = status.y-Math.floor(view.height/2);
					if(instant) {
						view.top = newTop;
					} else if(newTop!==view.top) {
						if((status.y<view.top+scrollPoint) || (status.y>view.top+view.height-scrollPoint)) {
							doScroll = true;
						}
					}
				}

				// animate scroll
				if(doScroll) {
					if(newLeft) {
						view.left = newLeft;
					}
					if(newTop) {
						view.top = newTop;
					}
					draw(true);
				}
			}
		}
		
		// --- resize ---
		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			view.width = Math.floor(canvas.width/tileSize);
			view.height = Math.floor(canvas.height/tileSize);
			view.xoffset = Math.floor((canvas.width-(view.width*tileSize))/2);
			view.yoffset = Math.floor((canvas.height-(view.height*tileSize))/2);

			scroll(true);					
			draw(true);
		}
		resize();
		$(window).on("resize", resize);


		// --- simulate ---
		var timer=null;

		function isMoving() {
			return status.nextX!=status.x || status.nextY!=status.y;
		}

		function move(time) {
			if(isMoving()) {
				status.moving=(time-status.moveStartTime)/150;

				if(status.moving>=1) {
					status.lastX = status.x;
					status.lastY = status.y;
					status.x = status.nextX;
					status.y = status.nextY;
					
					status.moving = status.moving - Math.floor(status.moving);

					scroll(false);
				}
			}

			if(!isMoving()) {
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

					var newTile=NULL;
					if(newX>=0 && newX<status.level.width && newY>=0 && newY<status.level.height) {
						newTile = status.level.map[newY][newX];
					}
					if(newTile===FLOOR || newTile===GRASS) {
						status.moveStartTime = time;
						status.nextX=newX;
						status.nextY=newY;
					}
				}
			}

			if(isMoving()) {
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

		// --- test JQuery ---
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