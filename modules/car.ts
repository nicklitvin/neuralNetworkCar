class Car {
    // center of car
    private x: number;
    private y: number;

    private width: number;
    private height: number;
    private controls: Controls;

    private ySpeed : number = 0;
    private acceleration : number = 0.2;
    private zeroSpeedThresh : number = 0.01;
    private maxSpeed : number = 5;
    private friction : number = 0.97;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.controls = new Controls();
    }

    draw(ctx: CanvasRenderingContext2D) : void {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.fillRect(
            this.x - this.width/2,
            this.y - this.height/2,
            this.width,
            this.height
        )
    }  
    
    update(canvas : HTMLCanvasElement) : void {
        if (this.controls.up) this.ySpeed -= this.acceleration;
        if (this.controls.down) this.ySpeed += this.acceleration;

        this.ySpeed *= this.friction;
        if (this.ySpeed < this.zeroSpeedThresh) this.ySpeed = 0;
        
        this.ySpeed = Math.min(this.maxSpeed,this.ySpeed);
        this.ySpeed = Math.max(this.maxSpeed*-1,this.ySpeed);

        this.y += this.ySpeed;

        if (this.y - this.height/2 < 0) {
            this.y = this.height/2;
            this.ySpeed *= -1;
        }
        if (this.y + this.height/2 > canvas.height) {
            this.y = canvas.height - this.height/2;
            this.ySpeed *= -1;
        }
    }
}