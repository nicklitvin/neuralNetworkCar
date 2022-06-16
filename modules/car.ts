class Car {
    // center of car
    public location: Coordinate;
    public corners : Coordinate[];
    public borders : Border[];

    // size
    private width: number = 30;
    private height: number = 50;

    // cosmetics
    private color : string;
    private damagedColor = "black";

    // 0 = ->, -pi = <-
    public angle : number = 0;
    private rotationSpeed : number = 0.05;

    // speed: negative = forward, positive = backward
    private speed : number = 0;
    private acceleration : number = 0.2;
    private zeroSpeedThresh : number = 0.01;
    private maxDummySpeed : number = 2;
    private maxSpeed : number = 3;
    private friction : number = 0.97;

    // controls
    public sensor : Sensor;
    public controls: Controls;
    public damaged = false;
    private isDummy : boolean;
    public brain : NeuralNetwork;
    private networkNodeCounts : number[];

    public carsPassed : number = 0;
    public score : number = 0;

    constructor(x: number, y: number, isDummy = true, brain : NeuralNetwork = null) {
        this.location = new Coordinate(x,y);
        this.isDummy = isDummy;
        this.controls = new Controls(this.isDummy);

        if (this.isDummy) {
            this.maxSpeed = this.maxDummySpeed;
            this.color = "red";
        } else {
            this.color = "blue";
            this.sensor = new Sensor(this);
            this.sensor.update();
            if (brain) {
                this.brain = brain;
            } else {
                this.networkNodeCounts = [this.sensor.rayCount,6,4]
                this.brain = new NeuralNetwork(this.networkNodeCounts);
            }    
        }
    }

    draw(ctx: CanvasRenderingContext2D, drawSensors : boolean) : void {
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

        if (this.sensor != null && drawSensors) {
            this.sensor.draw(ctx);
        }
    }  
    
    update(borders : Border[] = null, dummyCars : Car[] = null) : void {
        if (!this.damaged) {
            this.moveCar();
            this.updateCarCorners();
            this.updateCarBorders();
            
            if (!this.isDummy) {
                this.updateCarsPassed(dummyCars);
                this.sensor.update(borders);
                this.updateDamage(borders);
    
                const offsets : number[] = this.sensor.getRayValues().map(x => 1-x);
                const out : number[] = NeuralNetwork.feedForward(offsets,this.brain);
                this.controls.applyInput(out);
            }
        }
    }

    updateCarsPassed(dummyCars : Car[]) : void{
        this.carsPassed = 0;
        for (let car of dummyCars) {
            if (this.location.y < car.location.y) {
                this.carsPassed += 1;
            }
        }
    }

    private updateDamage(borders : Border[]) : void{
        if (!this.damaged) {
            for (let corner of this.corners) {
                let line = new Border(this.location,corner);
                for (let border of borders)
                if (Intersect.getPercentUntilWall(line,border) >= 0) {
                    this.damaged = true;
                    return;
                }
            }
        }
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

    private updateCarCorners() : void {
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

    private updateCarBorders() : void {
        this.borders = [];
        for (let i = 0; i < this.corners.length; i++) {
            this.borders.push(new Border(this.corners[i],this.corners[(i+1) % this.corners.length]));
        }
    }

    public calculatePerformance () : void {
        let score : number = 0;
        let exponent : number = 1;
        let factors : number = 3;

        score += exponent * (this.damaged ? 0 : factors - 1);
        exponent *= factors;

        score += exponent * Math.min(factors - 1, Math.max(0,-this.location.y / 100,factors));
        exponent *= factors;

        score += this.carsPassed;
        
        this.score = score;
    }
}

