class Car {
    // center of car
    public location: Coordinate;
    private corners : Coordinate[];

    // size
    private width: number;
    private height: number;

    // cosmetics
    private color = "white";
    private damagedColor = "black";

    // 0 = ->, -pi = <-
    public angle : number = 0;
    private rotationSpeed : number = 0.05;

    // speed: negative = forward, positive = backward
    private speed : number = 0;
    private acceleration : number = 0.2;
    private zeroSpeedThresh : number = 0.01;
    private maxSpeed : number = 5;
    private friction : number = 0.97;

    // controls
    public sensor : Sensor;
    private controls: Controls;
    private damaged = false;

    constructor(x: number, y: number, width: number, height: number) {
        this.location = new Coordinate(x,y);
        this.width = width;
        this.height = height;
        this.controls = new Controls();
        this.sensor = new Sensor(this);
        this.sensor.update();
    }

    draw(ctx: CanvasRenderingContext2D) : void {
        ctx.fillStyle = this.color;
        if (this.damaged) {
            ctx.fillStyle = this.damagedColor;
        }
        
        ctx.beginPath();
        ctx.moveTo(this.corners[0].x,this.corners[0].y)
        for (let i = 1; i < this.corners.length; i++) {
            ctx.lineTo(this.corners[i].x,this.corners[i].y);
        }

        ctx.fill();

        this.sensor.draw(ctx);
    }  
    
    update(borders : Border[]) : void {
        if (!this.damaged) {
            this.moveCar();
            this.sensor.update(borders);
            this.updateCarCorners();
            this.updateDamage(borders);
        }
    }

    private updateDamage(borders : Border[]) : void{
        for (let corner of this.corners) {
            let line = new Border(this.location,corner);
            for (let border of borders)
            if (Intersect.getPercentUntilWall(line,border) >= 0) {
                this.damaged = true;
                return;
            }
        }
        this.damaged = false;
    }

    private moveCar() : void {
        if (Math.abs(this.speed) > 0) {
            if (this.controls.left) this.angle -= this.rotationSpeed * Math.sign(-this.speed);
            if (this.controls.right) this.angle += this.rotationSpeed * Math.sign(-this.speed);
        }
        if (this.controls.forward) this.speed -= this.acceleration;
        if (this.controls.reverse) this.speed += this.acceleration;

        this.speed *= this.friction;
        if (Math.abs(this.speed) < this.zeroSpeedThresh) this.speed = 0;

        this.speed = Math.min(this.maxSpeed,this.speed);
        this.speed = Math.max(this.maxSpeed*-1,this.speed);

        this.location.x -= this.speed * Math.cos(this.angle - Math.PI/2);
        this.location.y -= this.speed * Math.sin(this.angle - Math.PI/2);
    }

    private updateCarCorners() {
        let corners = [];
        const radius = Math.hypot(this.width/2,this.height/2);
        const angle = Math.atan2(this.width,this.height);

        corners.push(new Coordinate(
            this.location.x - Math.sin(-this.angle-angle) * radius ,
            this.location.y - Math.cos(-this.angle-angle) * radius
        ))
        corners.push(new Coordinate(
            this.location.x - Math.sin(-this.angle+angle) * radius,
            this.location.y - Math.cos(-this.angle+angle) * radius
        ))
        corners.push(new Coordinate(
            this.location.x - Math.sin(-this.angle-angle+Math.PI) * radius,
            this.location.y - Math.cos(-this.angle-angle+Math.PI) * radius
        ))
        corners.push(new Coordinate(
            this.location.x - Math.sin(-this.angle+angle+Math.PI) * radius,
            this.location.y - Math.cos(-this.angle+angle+Math.PI) * radius
        ))
        this.corners = corners;
    }
}

