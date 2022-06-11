var Car = /** @class */ (function () {
    function Car(x, y, width, height) {
        this.ySpeed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = 5;
        this.friction = 0.97;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.controls = new Controls();
    }
    Car.prototype.draw = function (ctx) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    };
    Car.prototype.update = function (canvas) {
        if (this.controls.up)
            this.ySpeed -= this.acceleration;
        if (this.controls.down)
            this.ySpeed += this.acceleration;
        this.ySpeed *= this.friction;
        this.ySpeed = Math.min(this.maxSpeed, this.ySpeed);
        this.ySpeed = Math.max(this.maxSpeed * -1, this.ySpeed);
        this.y += this.ySpeed;
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2;
            this.ySpeed *= -1;
        }
        if (this.y + this.height / 2 > canvas.height) {
            this.y = canvas.height - this.height / 2;
            this.ySpeed *= -1;
        }
    };
    return Car;
}());
