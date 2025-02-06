class World {
  constructor() {
    this.tiles = [];
    this.tilesInRow = canvasWidth / tileSize;
    this.tilesInColumn = canvasHeight / tileSize;
    
    this.genesis();
  }

  genesis() {    
    const noiseValues = [];
    for (let i = 0; i < canvasWidth / tileSize; i++) {
      noiseValues.push([]);
      for (let j = 0; j < canvasHeight / tileSize; j++) {
        noiseValues[i].push(noise(i * 0.1, j * 0.1));
      }
    }
    
    for (let i = 0; i < noiseValues.length; i++) {
      this.tiles.push([]);
      for (let j = 0; j < noiseValues[0].length; j++) {
        let type = 'water';
        if (noiseValues[i][j] > 0.4) {
          type = 'land';
          
          const farmNoise = noise(i * 0.15, j * 0.15);
          if (farmNoise > 0.65) {
            type = 'farm';
          }
          
          const forestNoise = noise(i * 0.05, j * 0.05);
          if (forestNoise > 0.65) {
            type = 'forest';
          }
        }
        this.tiles[i].push(new Tile(i, j, type));
      }
    }
  }

  display() {
    for (let i = 0; i < this.tiles.length; i++) {
      for (let j = 0; j < this.tiles[i].length; j++) {
        const currentTile = this.tiles[i][j];
        const currentBatchType = currentTile.type;
        const currentBatchColor = currentTile.typeColor;
        let batchSize = 1;

        while (j + 1 < this.tiles[i].length && this.tiles[i][j + 1].type === currentBatchType) {
          j++;
          batchSize++;
        }

        fill(currentBatchColor);
        //stroke("orange")
        rect(currentTile.x * tileSize, currentTile.y * tileSize, tileSize, tileSize * batchSize);
      }
    }
  }
}
