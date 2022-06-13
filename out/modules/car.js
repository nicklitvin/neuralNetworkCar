class Car {
    constructor(x, y, width, height) {
        this.circleToCarRatio = 1 / 4;
        // cosmetics
        this.color = "white";
        this.frontColor = "orange";
        // 0 = ->, -pi = <-
        this.angle = 0;
        this.rotationSpeed = 0.05;
        // speed: negative = forward, positive = backward
        this.speed = 0;
        this.acceleration = 0.2;
        this.zeroSpeedThresh = 0.01;
        this.maxSpeed = 5;
        this.friction = 0.97;
        this.location = new Coordinate(x, y);
        this.width = width;
        this.height = height;
        this.frontCircleWidth = width * this.circleToCarRatio;
        this.controls = new Controls();
        this.sensor = new Sensor(this);
        this.sensor.update();
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.location.x, this.location.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.fillStyle = this.frontColor;
        ctx.arc(0, -this.height / 3, this.frontCircleWidth, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
        this.sensor.draw(ctx);
    }
    update(borders) {
        if (Math.abs(this.speed) > 0) {
            if (this.controls.left)
                this.angle -= this.rotationSpeed * Math.sign(-this.speed);
            if (this.controls.right)
                this.angle += this.rotationSpeed * Math.sign(-this.speed);
        }
        if (this.controls.forward)
            this.speed -= this.acceleration;
        if (this.controls.reverse)
            this.speed += this.acceleration;
        this.speed *= this.friction;
        if (Math.abs(this.speed) < this.zeroSpeedThresh)
            this.speed = 0;
        this.speed = Math.min(this.maxSpeed, this.speed);
        this.speed = Math.max(this.maxSpeed * -1, this.speed);
        this.location.x -= this.speed * Math.cos(this.angle - Math.PI / 2);
        this.location.y -= this.speed * Math.sin(this.angle - Math.PI / 2);
        this.sensor.update(borders);
    }
}
