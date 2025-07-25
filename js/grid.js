arcade.minesweeper.grid = function(minesweeper, grid_area, width, height, face) {
	this.tiles = [];
	this.tile_tds = []; // For the event listener only to find the proper index
	this.width = width;
	this.height = height;
	this.grid_area = grid_area;
  this.highlighted_tiles = [];
  this.face = face;
  this.minesweeper = minesweeper;
}

$.inherits(arcade.minesweeper.grid, $.EventTarget);

arcade.minesweeper.grid.prototype.tiles;
arcade.minesweeper.grid.prototype.tile_tds;
arcade.minesweeper.grid.prototype.width;
arcade.minesweeper.grid.prototype.height;
arcade.minesweeper.grid.prototype.grid_area;
arcade.minesweeper.grid.prototype.seed;
arcade.minesweeper.grid.prototype.right_mouse_down = false;
arcade.minesweeper.grid.prototype.highlighted_tiles = [];
arcade.minesweeper.grid.prototype.face;

arcade.minesweeper.grid.prototype.generate = function(number_mines, seed) {

  var self = this;

	var number_tiles = this.width * this.height;

	var i = number_mines;
	while(i--) {
    var tile = new arcade.minesweeper.tile(true);
    this.tiles.push(tile);
  }

	var i = number_tiles - number_mines;
	while(i--) {
    var tile = new arcade.minesweeper.tile(false);
    this.tiles.push(tile);
  }

	this.shuffle_tiles(seed);
  this.generate_tile_td_list();
	this.convert_tile_array_to_grid();
	this.detect_mines();
	this.print_tiles();

  this.grid_area
  // this
    .addEventListener("mouseover", function(e) {
      // console.log(e);
      if(e.target.nodeName !== "TD") return false;
      if(!self.minesweeper.mouse.left) return false; // If I don't have the left mouse button down then don't do this
      var tiles_to_highlight = [];
      tiles_to_highlight.push(self.get_tile_from_td(e.target));
      if(self.minesweeper.mouse.left && self.minesweeper.mouse.right) { // Shortcut to reveal 8 surrounding tiles
        var coordinates = self.get_coordinates_from_td(e.target);
        var surrounding_tiles = self.get_surrounding_tiles(coordinates.x, coordinates.y);
        tiles_to_highlight = tiles_to_highlight.concat(surrounding_tiles);
      }
     for(var i in tiles_to_highlight) {
        if(tiles_to_highlight[i].highlight()) {
          self.highlighted_tiles.push(tiles_to_highlight[i]);
        }
      }
    })
    .addEventListener("mouseout", function(e) {
      if(e.target.nodeName !== "TD") return false;

      // Unhighlight all of the currently highlighted tiles
      for(var i in self.highlighted_tiles) {
        self.highlighted_tiles[i].unhighlight();
      }

      // Clear the array
      self.highlighted_tiles = [];
    })
    .addEventListener("contextmenu", function(e) {
      e.preventDefault(); // Prevent right click
    });

}

// Reveals the current tile and the area around it
arcade.minesweeper.grid.prototype.reveal_area = function(x, y) {
  var self = this;

  var result = this.tiles[x][y].reveal(false);
  if(result === "flag") return false;
  else if(result === "mine") {
    this.reveal_grid(this.tiles[x][y]);
    return false;
  }

  // If this tile had no adjacent mines, try an area reveal
  if(this.tiles[x][y].get_mine_count() == 0) {

    var surrounding_tiles = self.get_surrounding_tiles(x, y);

    for(var i in surrounding_tiles) {
      if(!surrounding_tiles[i].is_revealed()) {
        // Recursively continue on
        var td = surrounding_tiles[i].get_element();
        var coordinates = self.get_coordinates_from_td(td);
        self.reveal_area(coordinates.x, coordinates.y);
      }
    }
  }

}

arcade.minesweeper.grid.prototype.reveal_grid = function(starting_tile) {
  var self = this;

	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
      if(this.tiles[x][y] !== starting_tile) this.tiles[x][y].reveal(true);
		}
	}

  var surrounding_tiles = self.get_surrounding_tiles(x, y);
  surrounding_tiles = this.shuffle_array(surrounding_tiles);
}

arcade.minesweeper.grid.prototype.get_tile_from_td = function(td) {
  var index = $.indexOf(this.tile_tds, td);
  var x = Math.floor((index) / this.height);
  var y = (index % this.height);
  if(x === -1 || y === -1) return null;
  return this.tiles[x][y];
}

arcade.minesweeper.grid.prototype.get_coordinates_from_td = function(td) {
  var index = $.indexOf(this.tile_tds, td);
  var x = Math.floor((index) / this.height);
  var y = (index % this.height);
  return {"x": x, "y": y}
}

// Generate a list of tile tds so I can do the entire grid with one event handler. I need the tds to figure out the tile I clicked on
arcade.minesweeper.grid.prototype.generate_tile_td_list = function() {
  for(var i in this.tiles) {
    this.tile_tds.push(this.tiles[i].get_element());
  }
}

arcade.minesweeper.grid.prototype.convert_tile_array_to_grid = function() {
	var tiles = [];
	for (var i = 0; i < this.width; i++) {
		tiles.push(this.tiles.splice(0, this.height));
	}
	this.tiles = tiles;
}

arcade.minesweeper.grid.prototype.print_tiles = function() {
	var t = $.createElement("table").setAttribute({"cellspacing": 0, "cellpadding": 0});
	var tb = $.createElement("tbody");
	for (var y = 0; y < this.height; y++) {
		var tr = $.createElement("tr");
		for (var x = 0; x < this.width; x++) {
			tr.appendChild(this.tiles[x][y].get_element());
		}
		tb.appendChild(tr);
	}
	t.appendChild(tb);
	this.grid_area.appendChild(t);
}

arcade.minesweeper.grid.prototype.shuffle_tiles = function(seed) {
// seed = "foo";
	if(!seed) seed = Math.floor(Math.random()*100000000000);
	Math.seedrandom(seed);
	this.seed = seed;

  // this.seed = "foo";

	var tmp, current, top = this.tiles.length;

	if(top) while(--top) {
		current = Math.floor(Math.random() * (top + 1));
		tmp = this.tiles[current];
		this.tiles[current] = this.tiles[top];
		this.tiles[top] = tmp;
	}
}

arcade.minesweeper.grid.prototype.shuffle_array = function(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
    }

    return array;
}

arcade.minesweeper.grid.prototype.detect_mines = function() {
	for (var y = 0; y < this.height; y++) {
		for (var x = 0; x < this.width; x++) {
      if(!this.tiles[x][y].is_a_mine()) {
        var mine_count = 0;
        var surrounding_tiles = this.get_surrounding_tiles(x, y);
        for(var i in surrounding_tiles) {
          if(surrounding_tiles[i].is_a_mine()) mine_count++;
        }
        this.tiles[x][y].set_mine_count(mine_count);
      }
		}
	}
}

arcade.minesweeper.grid.prototype.get_surrounding_tiles = function(x, y) {
  var tiles = [];
  for(var y_ = y-1; y_ <= y+1; y_++) {
    for(var x_ = x-1; x_ <= x+1; x_++) {
      if(x_ >= 0 && x_ < this.width && y_ >= 0 && y_ < this.height && !(x_ == x && y_ == y)) {
        tiles.push(this.tiles[x_][y_]);
       }
    }
  }
  return tiles;
}

arcade.minesweeper.grid.prototype.get_seed = function() {
	return this.seed;
}

arcade.minesweeper.grid.prototype.check_game_end = function() {
  let allSafeRevealed = true;
  let mineTriggered = false;
  let allMinesFlagged = true;

  for (let x = 0; x < this.width; x++) {
    for (let y = 0; y < this.height; y++) {
      const tile = this.tiles[x][y];
      if (tile.is_a_mine()) {
        if (tile.is_revealed()) {
          mineTriggered = true;
        }
        if (!tile.is_flagged()) {
          allMinesFlagged = false;
        }
      } else {
        if (!tile.is_revealed()) {
          allSafeRevealed = false;
        }
      }
    }
  }

  if (mineTriggered) {
    return "lost";
  }
  if (allSafeRevealed && allMinesFlagged) {
    return "won";
  }
  return null;
}