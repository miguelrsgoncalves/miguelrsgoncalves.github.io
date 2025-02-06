class House {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sizeX = Math.floor(random(1, 2)) * tileSize;
    this.sizeY = Math.floor(random(1, 3)) * tileSize;
    const randomR = Math.floor(random(100, 150));
    const randomG = Math.floor(random(50, 100));
    const randomB = Math.floor(random(0, 50));
    this.rgbColor = `rgb(${randomR},${randomG},${randomB})`;
  }
  
  display() {
    fill(this.rgbColor);
    rect(this.x, this.y, this.sizeX, this.sizeY);
  }
}
