class Car {
    // center of car
    public x: number;
    public y: number;

    // size
    private width: number;
    private height: number;
    private frontCircleWidth: number;
    private circleToCarRatio = 1/4;

    // cosmetics
    private color = "white";
    private frontColor = "orange";

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

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.frontCircleWidth = width * this.circleToCarRatio;
        this.controls = new Controls();
        this.sensor = new Sensor(this);
        this.sensor.update();
    }

    draw(ctx: CanvasRenderingContext2D) : void {
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.fillRect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        )

        ctx.fillStyle = this.frontColor;
        ctx.arc(0,-this.height/3,this.frontCircleWidth,0,2*Math.PI);
        ctx.fill();

        ctx.restore();

        this.sensor.draw(ctx);
    }  
    
    update() : void {
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

        this.x -= this.speed * Math.cos(this.angle - Math.PI/2);
        this.y -= this.speed * Math.sin(this.angle - Math.PI/2);

        this.sensor.update();
    }
}

