class Human {
  constructor(x, y, work) {
    this.x = x;
    this.y = y;
    this.work = work;
    this.carrying = null;
    this.carryIt = null;
    this.onBoat = false;
    this.destination = null;
    this.workingTime = 0;
    if(work == "woodcuter") this.workerColor = "orange";
    if(work == "farmer") this.workerColor = "red";
    if(work == "foodCarrier") this.workerColor = "rgb(255,0,255)";
    if(work == "woodCarrier") this.workerColor = "rgb(21,0,255)";
  }
  
  move() {
    if (this.carrying != null) {
      if(this.destination == null) {
        const nearestVillage = this.findNearestVillage();
        if(nearestVillage) {
          this.destination = nearestVillage;
        }
      } else {
        if (this.isNearbyVillage(this.destination)) {
          this.dropResource();
          this.destination = null;
        } else {
          this.moveToPlace(this.destination);
        }
      }
    } else {
      if (this.work === "woodcuter") {
        const forestTile = this.checkBiomeInArea("forest", 2);
        if (forestTile) {
          this.destination = null;
          if(this.workingTime >= 30) {
            civilization.resources.push(new Resource(this.x, this.y, "wood"));
            const randomChange = random(0, 100);
            if(randomChange > 70) world.tiles[forestTile.x][forestTile.y].changeTile("land");
            this.workingTime = 0;
            return;
          } else {
            this.workingTime++;
            return;
          }
        } else {
          if(this.destination == null) {
            const nearestForest = this.findNearestBiome("forest");
            if (nearestForest) {
              this.destination = nearestForest;
              this.moveToPlace(nearestForest);
            }
          }
          else {
            this.moveToPlace(this.destination);
          }
        }
      } else if (this.work === "farmer") {
        const farmTile = this.checkBiomeInArea("farm", 2);
        if (farmTile) {
          this.destination = null;
          if(this.workingTime >= 30) {
            civilization.resources.push(new Resource(this.x, this.y, "food"));
            const randomChange = random(0, 100);
            if(randomChange > 70) world.tiles[farmTile.x][farmTile.y].changeTile("land");
            this.workingTime = 0;
            return;
          } else {
            this.workingTime++;
            return;
          }
        } else {
          if(this.destination == null) {
            const nearestFarm = this.findNearestBiome("farm");
            if (nearestFarm) {
              this.destination = nearestFarm;
              this.moveToPlace(nearestFarm);
            }
          }
          else {
            this.moveToPlace(this.destination);
          }
        }
      } else if (this.work === "foodCarrier") {
        if(this.destination == null) {
          const nearestFoodResource = this.findNearestResource("food");
          if (nearestFoodResource) {
            this.destination = nearestFoodResource;
            this.moveToPlace(nearestFoodResource);
          }
        } else {
          if (this.isNearbyResource(this.destination)) {
            if(!this.destination.pickedUp) this.pickUpResource(this.destination);
            this.destination = null;
          } else {
            this.moveToPlace(this.destination);
          }
        }
      } else if (this.work === "woodCarrier") {
        if(this.destination == null) {
          const nearestWoodResource = this.findNearestResource("wood");
          if (nearestWoodResource) {
            this.destination = nearestWoodResource;
            this.moveToPlace(nearestWoodResource);
          }
        } else {
          if (this.isNearbyResource(this.destination)) {
            if(!this.destination.pickedUp) this.pickUpResource(this.destination);
            this.destination = null;
          } else {
            this.moveToPlace(this.destination);
          }
        }
      }
    }
  }
  
  moveToPlace(place) {
    if (!place) return;

    const dx = place.x - this.x;
    const dy = place.y - this.y;
    const distance = dist(this.x, this.y, place.x, place.y);

    let scaleFactor = 100 / grid_columns;
    let baseSpeed = (this.work == "foodCarrier" || this.work == "woodCarrier") ? 2.5 : 1.8;
    let stepSize = baseSpeed * scaleFactor;

    if (distance > stepSize) {
      const stepX = (dx / distance) * stepSize;
      const stepY = (dy / distance) * stepSize;

      this.x += stepX;
      this.y += stepY;
    }

    const currentTileX = Math.floor(this.x / tileSize);
    const currentTileY = Math.floor(this.y / tileSize);

    if (world.tiles[currentTileX] && world.tiles[currentTileX][currentTileY]) {
      this.onBoat = world.tiles[currentTileX][currentTileY].type === "water";
    }
  }
  
  findNearestBiome(biome) {
    let nearestDistance = Infinity;
    let nearestBiome = null;
    
    let tileList = (biome === "forest") ? world.forest_tiles : world.farm_tiles;

    for (let tile of tileList) {
      const distance = dist(this.x, this.y, tile.x * tileSize, tile.y * tileSize);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestBiome = createVector(tile.x * tileSize, tile.y * tileSize);
      }
    }

    return nearestBiome;
  }
  
  checkBiomeInArea(biomeType, tileRadius = 2) {
    const tileX = Math.floor(this.x / tileSize);
    const tileY = Math.floor(this.y / tileSize);

    for (let i = -tileRadius; i <= tileRadius; i++) {
      for (let j = -tileRadius; j <= tileRadius; j++) {
        const checkTileX = tileX + i;
        const checkTileY = tileY + j;

        if (
          checkTileX >= 0 &&
          checkTileX < world.tiles.length &&
          checkTileY >= 0 &&
          checkTileY < world.tiles[0].length &&
          world.tiles[checkTileX][checkTileY].type === biomeType
        ) {
          return { x: checkTileX, y: checkTileY };
        }
      }
    }

    return null;
  }
  
  findNearestResource(resourceType) {
    let nearestDistance = Infinity;
    let nearestResource = null;

    for (let i = 0; i < civilization.resources.length; i++) {
      const resource = civilization.resources[i];
      if (!resource.pickedUp && resource.type === resourceType) {
        const distance = dist(this.x, this.y, resource.x, resource.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestResource = resource;
          this.carryIt = i;
        }
      }
    }

    return nearestResource;
  }
  
  findNearestVillage() {
    let nearestDistance = Infinity;
    let nearestVillage = null;

    for (let i = 0; i < civilization.villages.length; i++) {
      const village = civilization.villages[i];
      const distance = dist(this.x, this.y, village.x, village.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestVillage = village;
      }
    }

    return nearestVillage;
  }
  
  isNearbyVillage(village) {
    const distance = dist(this.x, this.y, village.x, village.y);
    return distance < tileSize * 1.2;
  }

  isNearbyResource(resource) {
    const distance = dist(this.x, this.y, resource.x, resource.y);
    return distance < tileSize * 1.2;
  }
  
  pickUpResource(resource) {
    this.carrying = resource;
    resource.pickedUp = true;
  }
  
  dropResource() {
    if (this.carrying) {
      if (this.carrying.type === "food") {
        civilization.food += this.carrying.value;
      } else if (this.carrying.type === "wood") {
        civilization.wood += this.carrying.value;
      }
      this.carrying.droppedOff = true;
      this.carrying = null;
    }
  }
  
  display() {
    if(this.carrying != null) {
      this.carrying.move(this.x, this.y);
    }
    fill(this.workerColor);
    circle(this.x, this.y, tileSize);
    if(this.onBoat) {
      fill("brown")
      rect(this.x - tileSize, this.y + tileSize / 5, tileSize * 2, tileSize / 2);
      rect(this.x, this.y - tileSize * 1.5, tileSize / 2, tileSize * 2);
      fill("white")
      rect(this.x, this.y - tileSize * 1.5, tileSize, tileSize);
    }
  }
}