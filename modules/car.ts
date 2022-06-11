class Car {
    private x: number;
    private y: number;
    private width: number;
    private height: number;
    private ctx: CanvasRenderingContext2D;
    private controls: Controls;

    private ySpeed : number = 0;
    private acceleration : number = 0.2;

    constructor(x: number, y: number, width: number, height: number, ctx: CanvasRenderingContext2D) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.controls = new Controls();
    }

    draw() : void {
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.fillRect(
            this.x - this.width/2,
            this.y - this.y/2,
            this.width,
            this.height
        )
    }  
    
    update() : void {
        if (this.controls.up) this.ySpeed -= this.acceleration;
        if (this.controls.down) this.ySpeed += this.acceleration;
        this.y += this.ySpeed;
    }
}