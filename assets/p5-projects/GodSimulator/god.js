class God {
  constructor() {
    this.godPoints = 5000;
    this.selectedPower = null;
    this.powerColor = "white";
  }
  
  usePower(x, y) {
    // Map the hand coordinates to tile coordinates
    let canvasX = map(x, 0, 1, canvasWidth, 0);
    let canvasY = map(y, 0, 1, 0, canvasHeight);

    // Convert canvas coordinates to tile coordinates
    let tileX = Math.floor(canvasX / tileSize);
    let tileY = Math.floor(canvasY / tileSize);

    // Ensure the tile coordinates are within valid bounds
    tileX = constrain(tileX, 0, Math.floor(canvasWidth / tileSize) - 1);
    tileY = constrain(tileY, 0, Math.floor(canvasHeight / tileSize) - 1);

    switch (this.selectedPower) {
      case 0:
        if (this.godPoints > 25 && world.tiles[tileX][tileY].type == "land") {
          world.tiles[tileX][tileY].changeTile("farm");
          this.godPoints -= 25;
        }
        break;
      case 1:
        if (this.godPoints > 25 && world.tiles[tileX][tileY].type == "land") {
          world.tiles[tileX][tileY].changeTile("forest");
          this.godPoints -= 25;
        }
        break;
      case 2:
        if (civilization && civilization.humans.length > 0) {
          const killRadius = 2;
          for (let i = civilization.humans.length - 1; i >= 0; i--) {
            const human = civilization.humans[i];
            const distance = dist(human.x, human.y, canvasX, canvasY);
            if (distance <= killRadius * tileSize) {
              civilization.humans.splice(i, 1);
              this.godPoints += 500;
            }
          }
        }
        break;
      case 3:
        if (this.godPoints > 2500 && !nukeIsGoingOff) {
          nukeIsGoingOff = true;
          this.godPoints -= 2500;
          nukeLocation = [canvasX - nukePng.width / 2, canvasY - nukePng.height];
          const killRadius = canvasWidth / 4;

          if (civilization && civilization.humans.length > 0) {
            for (let i = civilization.humans.length - 1; i >= 0; i--) {
              const human = civilization.humans[i];
              const distance = dist(human.x, human.y, canvasX, canvasY);

              if (distance <= killRadius) {
                civilization.humans.splice(i, 1);
                this.godPoints += 500;
              }
            }
          }

          if (civilization) {
            for (let i = civilization.villages.length - 1; i >= 0; i--) {
              const village = civilization.villages[i];
              const distance = dist(village.x, village.y, canvasX, canvasY);

              if (distance <= killRadius) {
                civilization.villages.splice(i, 1);
              }
            }

            for (let i = civilization.resources.length - 1; i >= 0; i--) {
              const resource = civilization.resources[i];
              const distance = dist(resource.x, resource.y, canvasX, canvasY);

              if (distance <= killRadius) {
                civilization.resources.splice(i, 1);
              }
            }
          }

          for (let i = 0; i < world.tiles.length; i++) {
            for (let j = 0; j < world.tiles[i].length; j++) {
              const currentTile = world.tiles[i][j];
              const distance = dist(currentTile.x * tileSize, currentTile.y * tileSize, canvasX, canvasY);

              if (distance <= killRadius) {
                world.tiles[i][j].changeTile("schorch");
              }
            }
          }
        }
        break;
      default:
        break;
    }
  }
  
  switchPower(power) {
    this.selectedPower = power;
    
    switch(power) {
      case 0:
        this.powerColor = "yellow";
        break;
      case 1:
        this.powerColor = "lime";
        break;
      case 2:
        this.powerColor = "red";
        break;
      case 3:
        this.powerColor = "black";
        break;
      default:
        this.powerColor = "white";
        break;
    }
  }
}