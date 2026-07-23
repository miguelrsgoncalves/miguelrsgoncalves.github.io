class Tile {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.typeColor = this.getColor(this.type);
  }
  
  getColor(type) {
    switch (type) {
      case 'land': return 'green';
      case 'water': return 'teal';
      case 'forest': return "darkgreen";
      case 'farm': return "rgb(190,163,55)";
      case 'schorch': return "rgb(46,46,46)";
      default: return 'teal';
    }
  }
  
  changeTile(type) {
    if (this.type === 'forest') world.forest_tiles = world.forest_tiles.filter(t => t !== this);
    if (this.type === 'farm') world.farm_tiles = world.farm_tiles.filter(t => t !== this);

    this.type = type;
    this.typeColor = this.getColor(type);
    
    if (type === 'forest') world.forest_tiles.push(this);
    if (type === 'farm') world.farm_tiles.push(this);

    world.updateTileBuffer(this.x, this.y);
  }
}