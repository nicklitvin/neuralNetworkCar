class Sensor {
    constructor(car) {
        this.rayCount = 3;
        this.rayLength = 100;
        this.raySpread = Math.PI / 4;
        this.rayColor = "yellow";
        this.rayWidth = 5;
        this.car = car;
    }
    update() {
        this.rays = [];
        let currCordinate = new Coordinate(this.car.x, this.car.y);
        let angleSplit = this.raySpread / (this.rayCount + 1);
        let angle = this.car.angle - this.raySpread / 2;
        for (let i = 1; i <= this.rayCount; i++) {
            angle += angleSplit;
            let endCoordinate = new Coordinate(this.car.x + Math.cos(angle - Math.PI / 2) * this.rayLength, this.car.y + Math.sin(angle - Math.PI / 2) * this.rayLength);
            let newRay = new Border(currCordinate, endCoordinate);
            this.rays.push(newRay);
        }
    }
    draw(ctx) {
        ctx.lineWidth = this.rayWidth;
        ctx.strokeStyle = this.rayColor;
        for (let ray of this.rays) {
            ctx.beginPath();
            ctx.moveTo(ray.from.x, ray.from.y);
            ctx.lineTo(ray.to.x, ray.to.y);
            ctx.stroke();
        }
    }
}
