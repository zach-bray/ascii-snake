window.onload = init;
window.onkeydown = keyDown;
window.onkeyup = keyUp;

var game, options;
var snake, apple;
var timer;
var name;


var partyCols = [["#ff00ff", "#f0adfa", "#00ff00", "#ff0000"],
				["#00aedb","#a200ff","#f47835","#d41243","#8ec127"],
				["#ffc2cd","#e5d0ff","#ff6289","#fc3468","#bf8bff"]];

function init() {
	game = {	element: document.getElementById("game"),
				ticks: 1,
				width: 21,
				height: 21,
				over: false,
				score: 0,
				save: false};

	options = {	pause: false,
				drawGrid: false,
				partyMode: 0,
				boundaries: true,
				strobe: false
			  };

	snake = { 	body: [{
					x: parseInt(game.width / 2), 
					y: parseInt(game.height / 2)+ 1,
					px: -1,
					py: -1	
				}],
				dir: -1, // 0u, 1d, 2l, 3r
			}; 
	apple = {	x: -1,
				y: -1
			};
	newApple();
	game.score = 0;
	name = "";
	if (timer == null)
		timer = setInterval(update, 75);
}

function update() {
	if (!options.pause && !game.over)
		moveSnake();
	
	generateBoard();
	
	if (options.partyMode != 0)
		party();
	
	if (options.strobe && game.ticks % 2 == 0)
		strobe();

	game.ticks++;
}

function party() {
	var cols = partyCols[options.partyMode-1];
	game.element.style.color = 
		cols[Math.floor(Math.random() * cols.length)];
}

function strobe() {
	if (game.element.style.visibility == "visible")
		game.element.style.visibility = "hidden";
	else
		game.element.style.visibility = "visible";
}

function moveSnake() {
	snake.body[0].px = snake.body[0].x;
	snake.body[0].py = snake.body[0].y;
	if (snake.dir == 0)
		snake.body[0].y--;
	if (snake.dir == 1)
		snake.body[0].y++;
	if (snake.dir == 2)
		snake.body[0].x--;
	if (snake.dir == 3)
		snake.body[0].x++;

	// save old position and set position to the part infronts prev position
	for (var s = 1; s < snake.body.length; s++) {
		snake.body[s].px = snake.body[s].x;
		snake.body[s].py = snake.body[s].y;

		snake.body[s].x = snake.body[s-1].px;
		snake.body[s].y = snake.body[s-1].py;
	}	

	// collision with apple
	if (snake.body[0].x == apple.x && snake.body[0].y == apple.y) {
		snake.body.push({x: snake.body[snake.body.length-1].x, y:snake.body[snake.body.length-1].y});
		newApple();
	}

	// checks for collision of snake on snake
	for (var s = 2; s < snake.body.length; s++)
		if (snake.body[0].x == snake.body[s].x && snake.body[0].y == snake.body[s].y)
			game.over = true;

	// game over if out of bounds
	if (options.boundaries && snake.body[0].x >= game.width || snake.body[0].x < 0 ||
			snake.body[0].y >= game.height || snake.body[0].y < 0)
		game.over = true;

	// no boundaries, wrap around
	if (!options.boundaries) {
		if (snake.body[0].x == -1)
			snake.body[0].x = game.width-1;
		if (snake.body[0].x == game.width)
			snake.body[0].x = 0;

		if (snake.body[0].y == -1)
			snake.body[0].y = game.height-1;
		if (snake.body[0].y == game.height)
			snake.body[0].y = 0;
	}
}

function generateBoard() {
	var text = "&nbsp;";

	// draw the top border
	for (var x = 0; x < game.width; x++) 
		text += "_ ";
	text += "<br>";

	for (var y = 0; y < game.height; y++) {
		loop: for (var x = 0; x < game.width; x++) {

			// add the left border
			if (x == 0)
				text += "|";

			/*
				GENERATE MENUS ____---___--_-__--___-__-_ 
			*/
			if (snake.dir == -1 && y >= 2 && y <= 5 && x == 3 && !options.pause && !game.over) {
				text += generateStartMenu(y);
				x += 15;
			}
			// draws the pause menu
			if (options.pause && x == 4 && y >= 2 && y <= 10) {
				text += generatePauseMenu(y);
				x += 13;
			} 
			// game over
			if (game.over && x == 4 && y >= 2 && y <= 8 && !game.save) {
				text += generateGameOver(y);
				x += 13;
			}
			if (game.save && x == 5 && y >= 2 && y <= 10) {
				text += generateSave(y);
				x += 11;
			}



			// draw the snake bits
			for (var s = 0; s < snake.body.length; s++) {
				if (x == snake.body[s].x && y == snake.body[s].y) {	
					text += "*" + (options.drawGrid || x == game.width-1? "|" : "&nbsp;");
					continue loop;
				}
			}
			
			// draw the apple	
			if (x == apple.x && y == apple.y)
				text += "@" + (options.drawGrid || x == game.width-1? "|" : "&nbsp;");
			// draws the bottom line
			else if (y == game.height - 1 && !options.drawGrid)
				text += "_" + (x == game.width-1? "|" : "&nbsp;");
			// blank space
			else
				text += (options.drawGrid? "_|" : "&nbsp;" + (x == game.width-1? "|" : "&nbsp;"));
		}
		text += "<br>";
	}

	text += "|score:" + game.score + " |";
	game.element.innerHTML = text;
}

function generateStartMenu(y) {
	var text;
	// adds the grid line if in drawGrid
	var end = options.drawGrid? "|  |" : "|" + nbsp(2);

	if (y == 2)
		text = nbsp(1) + " _ _ _ _ _ _ _ _ _ _ _ _ _" + nbsp(2) + (options.drawGrid? "|" : " ");
	if (y == 3)
		text = " | W, S, A, or D to start" + nbsp(2) + end;
	if (y == 4)
		text = nbsp(1) + "|_ _ _ _ _ _ _ _ _ _ _ _ _" + end;
	if (y == 5)
		text = (options.drawGrid? "_ _ _ _ _ _ _ _ _ _ _ _ _ _ _|" : nbsp(30));

	return text;
}

// moved this to a separate function to clean up the genereateBoard function
function generatePauseMenu(y) {
	var text;
	// adds the grid line if in drawGrid
	var end = options.drawGrid? "|  |" : "|" + nbsp(2);
	
	if (y == 2)
		text = nbsp(2) + "_ _ _ _ _ _ _ _ _ _ _" + nbsp(2) + (options.drawGrid? "|" : " ");
	if (y == 3)
		text = nbsp(1) + "|" + nbsp(5) + "P A U S E D" + nbsp(5) + (end);
	if (y == 4)
		text = nbsp(1) + "|" + nbsp(21) + end;
	if (y == 5)
		text = nbsp(1) + "|" + nbsp(3) + "drawGrid(d): " + (options.drawGrid? 1 : 0) + nbsp(4) + end;
	if (y == 6)
		text = nbsp(1) + "|" + nbsp(3) + "partyMode(p): " + options.partyMode + nbsp(3) + end;
	if (y == 7)
		text = nbsp(1) + "|" + nbsp(3) + "boundaries(b): " + (options.boundaries? 1 : 0) + nbsp(2) + end;
	if (y == 8)
		text = nbsp(1) + "|" + nbsp(3) + "strobe(s): " + (options.strobe? 1 : 0) + nbsp(6) + end;
	if (y == 9)
		text = nbsp(1) + "|_ _ _ _ _ _ _ _ _ _ _" + end;
	if (y == 10)
		text = (options.drawGrid? "_ _ _ _ _ _ _ _ _ _ _ _ _|" : nbsp(26));

	return text;
}

function generateGameOver(y) {
	var text;

	var end = options.drawGrid? "|  |" : "|" + nbsp(2);

	if (y == 2)
		text = nbsp(2) + "_ _ _ _ _ _ _ _ _ _ _" + nbsp(2) + (options.drawGrid? "|" : " ");
	if (y == 3)
		text = nbsp(1) + "|" + nbsp(2)+  "G A M E" + nbsp(3) + "O V E R" + nbsp(2) + (end);
	if (y == 4)
		text = " |" + nbsp(21) + end;
	if (y == 5) {
		text = " |" + nbsp(4) + "score: " + game.score;
		text += nbsp(43 - text.length) + end;
	}
	if (y == 6)
		text = " | restart(r)" + nbsp(2) + "save(s) " + end;
	if (y == 7) 
		text = nbsp(1) + "|_ _ _ _ _ _ _ _ _ _ _" + end;
	if (y == 8)
		text = (options.drawGrid? "_ _ _ _ _ _ _ _ _ _ _ _ _|" : nbsp(26));
	return text;
}

function generateSave(y) {
	var text;

	var end = options.drawGrid? "|  |" : "|" + nbsp(2);

	if (y == 2) 
		text = nbsp(2) + "_ _ _ _ _ _ _ _ _" + nbsp(2) + (options.drawGrid? "|" : " ");
	if (y == 3)
		text = " |" + nbsp(5) + "S A V E" + nbsp(5) + end;
	if (y == 4)
		text = " |" + nbsp(17) + end;
	if (y == 5)
		text = " |" + nbsp(3) + "enter name:" + nbsp(3) + end;
	if (y == 6)
		text = " |" + nbsp(3 + (5-name.length/2)) + name.replace(/ /g, "&nbsp;") + (game.ticks % 10 < 5 || name.length > 10? "&nbsp;" : "_") + 
			nbsp(2 + (5-(name.length-1)/2)) + end;
	if (y == 7)
		text = " |" + nbsp(17) + end;
	if (y == 8)
		text = " |" + nbsp(3) + "save(enter)" + nbsp(3) + end;
	if (y == 9) 
		text = nbsp(1) + "|_ _ _ _ _ _ _ _ _" + end;
	if (y == 10)
		text = (options.drawGrid? "_ _ _ _ _ _ _ _ _ _ _|" : nbsp(22));

	return text;
}

// gets a new random positon for the apple
// checks to make sure it isn't placed on a part of snake
function newApple() {
	game.score += 5 + parseInt(120 / game.ticks); 
	game.ticks = 0;
	apple.x = Math.floor(Math.random() * game.width);
	apple.y = Math.floor(Math.random() * game.height);
	for (var s = 0; s < snake.body.length; s++)
		if (apple.x == snake.body[s].x && apple.x == snake.body[s].y)
			newApple();
}

// returns i amount of non breaking spaces
// (when using a lot of spaces they get removed in the html.)
function nbsp(i) {
	var text = "";
	while (i-- > 0)
		text += "&nbsp;";
	return text;
}


/*
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 
					KEY LISTENER
---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- 
*/
function keyDown(e){	
	var kc =  e.keyCode || e.which;
	
	if (!options.pause) {
		if (kc == 87 && snake.dir != 1)
			snake.dir = 0;
		if (kc == 83 && snake.dir != 0)
			snake.dir = 1;
		if (kc == 65 && snake.dir != 3)
			snake.dir = 2;
		if (kc == 68 && snake.dir != 2)
			snake.dir = 3;
	}
	
	if (kc == 32 && !game.save) options.pause = !options.pause;

	if (options.pause) {
		if (kc == 68)
			options.drawGrid = !options.drawGrid;
		if (kc == 80) {
			options.partyMode = (options.partyMode + 1) % (partyCols.length + 1);
			if (options.partyMode == 0)
				game.element.style.color = "#000000";
		}
		if (kc == 66)
			options.boundaries = !options.boundaries;
		if (kc == 83) {
			options.strobe = !options.strobe;
			if (!options.strobe)
				game.element.style.visibility = "visible";
		}
		console.log(kc);
	}
	if (game.over && !options.pause) {
		if (kc == 82)
			init();
		if (kc == 83)
			game.save = true;

	}
	if (game.save) {
		if (kc == 8)
			name = name.substr(0, name.length-1);
		else if (name.length <= 10)
			name += String.fromCharCode(kc);
		if (kc == 13)
			init();

	}
}

function keyUp(e){
	var kc =  e.keyCode || e.which;
}