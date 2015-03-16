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

			var width, height, xoffset, yoffset;

			// load images


			// draw
			function draw() {
				console.log("draw");
				if(width && height) {
					var floor_image = new Image();
					floor_image.src = "media/floor.png";
					floor_image.onload = function() {
						for(var y=wallWidth; y<height-wallWidth; y++) {
							for(var x=wallWidth; x<width-wallWidth; x++) {
								context.drawImage(floor_image, x*tileSize+xoffset, y*tileSize+yoffset);		
							}
						}
					}

					var wall_image = new Image();
					wall_image.src = "media/wall.png";
					wall_image.onload = function() {
						var x, y;

						for(y=0; y<wallWidth; y++) {
							for(x=0; x<width; x++) {
								context.drawImage(wall_image, x*tileSize+xoffset, y*tileSize+yoffset);	
							}
						}
						for(y=1; y<height-1; y++) {
							for(x=0; x<wallWidth; x++) {
								context.drawImage(wall_image, x*tileSize+xoffset, y*tileSize+yoffset);
								context.drawImage(wall_image, (width-x-1)*tileSize+xoffset, y*tileSize+yoffset);
							}
						}
						for(y=height-wallWidth; y<height; y++) {
							for(x=0; x<width; x++) {
								context.drawImage(wall_image, x*tileSize+xoffset, y*tileSize+yoffset);	
							}
						}
					}
				}
			}
			
			// resize
			function resize() {
				console.log("resize");
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;

				width = Math.floor(canvas.width/tileSize);
				height = Math.floor(canvas.height/tileSize);
				xoffset = (canvas.width-(width*tileSize))/2;
				yoffset = (canvas.height-(height*tileSize))/2;

				draw();
			}
			resize();
			$(window).on("resize", resize);


		})();

		// test JQuery
		$("<div>")
			.appendTo("body")
			.text("Hello, World!")
			.addClass("popup")
			.hide()
			.fadeIn();
	});
})(jQuery);