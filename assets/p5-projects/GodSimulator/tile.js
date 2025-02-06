class Tile {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.typeColor = this.getColor(this.type);
  }
  
  getColor() {
    switch (this.type) {
      case 'land':
        return 'green';
      case 'water':
        return 'teal';
      case 'forest':
        return "darkgreen"
      case 'farm':
        return "rgb(190,163,55)"
      case 'schorch':
        return "rgb(46,46,46)"
      default:
        return 'teal';
    }
  }
  
  changeTile(type) {
    this.type = type;
    this.typeColor = this.getColor(type);
  }
}