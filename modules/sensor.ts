class Sensor {
    private car : Car;

    public rayCount = 8;
    private rayLength = 100;
    private raySpread = 3 * Math.PI / 2;

    private rays: Border[];
    private rayColor = "yellow";
    private rayColorIntersected = "black";
    private rayWidth = 3;

    private borders : Border[];

    constructor(car : Car) {
        this.car = car;
    }

    update(borders : Border[] = []) : void {
        this.rays = [];
        this.borders = borders;

        let currCordinate = new Coordinate(this.car.location.x,this.car.location.y);
        let angleSplit = this.raySpread / (this.rayCount + 1); 
        let angle = this.car.angle - this.raySpread / 2; 

        for (let i = 1; i <= this.rayCount; i++) {
            angle += angleSplit;

            let endCoordinate = new Coordinate(
                this.car.location.x + Math.cos(angle - Math.PI/2) * this.rayLength,
                this.car.location.y + Math.sin(angle - Math.PI/2) * this.rayLength
            );

            let newRay = new Border(currCordinate,endCoordinate);
            this.rays.push(newRay);
        }
    }

    draw(ctx : CanvasRenderingContext2D) : void{
        ctx.lineWidth = this.rayWidth;

        for (let ray of this.rays) {
            ctx.strokeStyle = this.rayColor;

            let dist = this.getShortestPercent(ray);
            let stopX = ray.from.x + (ray.to.x - ray.from.x) * dist;
            let stopY = ray.from.y + (ray.to.y - ray.from.y) * dist;  

            ctx.beginPath();
            ctx.moveTo(ray.from.x,ray.from.y);
            ctx.lineTo(stopX,stopY);
            ctx.stroke();

            ctx.strokeStyle = this.rayColorIntersected;
            ctx.beginPath();
            ctx.moveTo(stopX,stopY);
            ctx.lineTo(ray.to.x,ray.to.y);
            ctx.stroke();
        }
    }

    getRayValues() : number[] {
        let result : number[] = [];
        for (let ray of this.rays) {
            result.push(this.getShortestPercent(ray));
        }
        return result;
    }

    private getShortestPercent(ray : Border) : number{
        let distance = 1;
        for (let border of this.borders) {
            let curr = Intersect.getPercentUntilWall(ray,border);
            if (curr >= 0) distance = Math.min(distance,curr);
        }
        return distance;
    }
}