var Car = /** @class */ (function () {
    function Car(x, y, width, height, ctx) {
        this.ySpeed = 0;
        this.acceleration = 0.2;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.controls = new Controls();
    }
    Car.prototype.draw = function () {
        this.ctx.fillStyle = "white";
        this.ctx.beginPath();
        this.ctx.fillRect(this.x - this.width / 2, this.y - this.y / 2, this.width, this.height);
    };
    Car.prototype.update = function () {
        if (this.controls.up)
            this.ySpeed -= this.acceleration;
        if (this.controls.down)
            this.ySpeed += this.acceleration;
        this.y += this.ySpeed;
    };
    return Car;
}());
