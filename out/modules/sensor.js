class Sensor {
    constructor(car) {
        this.rayCount = 4;
        this.rayLength = 100;
        this.raySpread = Math.PI;
        this.rayColor = "yellow";
        this.rayColorIntersected = "black";
        this.rayWidth = 3;
        this.car = car;
    }
    update(borders = []) {
        this.rays = [];
        this.borders = borders;
        let currCordinate = new Coordinate(this.car.location.x, this.car.location.y);
        let angleSplit = this.raySpread / (this.rayCount + 1);
        let angle = this.car.angle - this.raySpread / 2;
        for (let i = 1; i <= this.rayCount; i++) {
            angle += angleSplit;
            let endCoordinate = new Coordinate(this.car.location.x + Math.cos(angle - Math.PI / 2) * this.rayLength, this.car.location.y + Math.sin(angle - Math.PI / 2) * this.rayLength);
            let newRay = new Border(currCordinate, endCoordinate);
            this.rays.push(newRay);
        }
    }
    draw(ctx) {
        ctx.lineWidth = this.rayWidth;
        for (let ray of this.rays) {
            ctx.strokeStyle = this.rayColor;
            let dist = this.getShortestPercent(ray);
            let stopX = ray.from.x + (ray.to.x - ray.from.x) * dist;
            let stopY = ray.from.y + (ray.to.y - ray.from.y) * dist;
            ctx.beginPath();
            ctx.moveTo(ray.from.x, ray.from.y);
            ctx.lineTo(stopX, stopY);
            ctx.stroke();
            ctx.strokeStyle = this.rayColorIntersected;
            ctx.beginPath();
            ctx.moveTo(stopX, stopY);
            ctx.lineTo(ray.to.x, ray.to.y);
            ctx.stroke();
        }
    }
    getRayValues() {
        let result = [];
        for (let ray of this.rays) {
            result.push(this.getShortestPercent(ray));
        }
        return result;
    }
    getShortestPercent(ray) {
        let distance = 1;
        for (let border of this.borders) {
            let curr = Intersect.getPercentUntilWall(ray, border);
            if (curr >= 0)
                distance = Math.min(distance, curr);
        }
        return distance;
    }
}
