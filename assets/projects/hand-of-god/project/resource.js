class Resource {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    if(type == "food") this.value = Math.floor(random(2500, 5000));
    if(type == "wood") this.value = Math.floor(random(500, 2500));
    this.typeColor = this.getColor(type);
    this.pickedUp = false;
    this.droppedOff = false;
  }
  
  getColor(type) {
    if(type == "wood") {
      return "brown";
    }
    else if(type == "food") {
      return "yellow"
    }
  }
  
  move(x, y) {
    this.x = x;
    this.y = y;
  }
  
  display() {
    fill(this.typeColor);
    rect(this.x - tileSize/2, this.y - tileSize, tileSize, tileSize);
  }
}