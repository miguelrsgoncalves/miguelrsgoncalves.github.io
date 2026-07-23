class World {
  constructor(cols, rows) {
    this.tiles = [];
    this.tiles_in_row = cols;
    this.tiles_in_column = rows;
    
    this.forest_tiles = []; 
    this.farm_tiles = [];
    
    this.genesis();
    this.renderBuffer();
  }

  genesis() {    
    const noiseValues = [];
    for (let i = 0; i < this.tiles_in_row; i++) {
      noiseValues.push([]);
      for (let j = 0; j < this.tiles_in_column; j++) {
        noiseValues[i].push(noise(i * 0.1, j * 0.1));
      }
    }
    
    for (let i = 0; i < noiseValues.length; i++) {
      this.tiles.push([]);
      for (let j = 0; j < noiseValues[0].length; j++) {
        let type = 'water';
        if (noiseValues[i][j] > 0.4) {
          type = 'land';
          if (noise(i * 0.15, j * 0.15) > 0.65) type = 'farm';
          if (noise(i * 0.05, j * 0.05) > 0.65) type = 'forest';
        }
        
        let newTile = new Tile(i, j, type);
        this.tiles[i].push(newTile);
        
        if (type === 'forest') this.forest_tiles.push(newTile);
        if (type === 'farm') this.farm_tiles.push(newTile);
      }
    }
  }

  renderBuffer() {
    world_graphics_buffer = createGraphics(canvasWidth, canvasHeight);
    world_graphics_buffer.noStroke();
    
    for (let i = 0; i < this.tiles.length; i++) {
      for (let j = 0; j < this.tiles[i].length; j++) {
        const currentTile = this.tiles[i][j];
        world_graphics_buffer.fill(currentTile.typeColor);
        world_graphics_buffer.rect(currentTile.x * tileSize, currentTile.y * tileSize, tileSize + 1, tileSize + 1);
      }
    }
  }

  updateTileBuffer(tileX, tileY) {
    if (!world_graphics_buffer) return;
    const tile = this.tiles[tileX][tileY];
    world_graphics_buffer.fill(tile.typeColor);
    world_graphics_buffer.rect(tile.x * tileSize, tile.y * tileSize, tileSize + 1, tileSize + 1);
  }
}