/**
 * Car object that can be controlled and moved.
 */
class Car {
    constructor(x, y, isDummy = true, brain = null) {
        // adjustables
        this.dummyColor = "red";
        this.playerColor = "blue";
        this.damagedColor = "black";
        this.width = 30;
        this.height = 50;
        this.acceleration = 0.2;
        this.zeroSpeedThresh = 0.01;
        this.maxDummySpeed = 2;
        this.maxPlayerSpeed = 4;
        this.friction = 0.97;
        this.rotationSpeed = 0.05;
        this.speed = 0;
        this.carsPassed = 0;
        this.score = 0;
        this.angle = 0;
        this.damaged = false;
        this.isDummy = isDummy;
        this.location = new Coordinate(x, y);
        this.controls = new Controls(this.isDummy);
        if (this.isDummy) {
            this.maxSpeed = this.maxDummySpeed;
            this.color = this.dummyColor;
        }
        else {
            this.maxSpeed = this.maxPlayerSpeed;
            this.color = this.playerColor;
            this.sensor = new Sensor(this);
            this.sensor.update();
            if (brain) {
                this.brain = brain;
            }
            else {
                this.brain = new NeuralNetwork(this.sensor.rayCount, this.controls.numControls);
            }
        }
    }
    /**
     * Draws car based on corners and sensors if exists and specified.
     *
     * @param ctx 2d context of canvas
     * @param drawSensors true/false
     */
    draw(ctx, drawSensors) {
        ctx.fillStyle = this.color;
        if (this.damaged) {
            ctx.fillStyle = this.damagedColor;
        }
        ctx.beginPath();
        ctx.moveTo(this.corners[0].x, this.corners[0].y);
        for (let i = 1; i < this.corners.length; i++) {
            ctx.lineTo(this.corners[i].x, this.corners[i].y);
        }
        ctx.fill();
        if (this.sensor != null && drawSensors) {
            this.sensor.draw(ctx);
        }
    }
    /**
     * Updates Car's location and state if not damaged. Dummy cars
     * don't need obstacles and list of dummy cars.
     *
     * @param borders list of all obstacles, default is null
     * @param dummyCars list of dummy cars, default is null
     */
    update(borders = null, dummyCars = null) {
        if (!this.damaged) {
            this.moveCar();
            this.updateCarCorners();
            this.updateCarBorders();
            if (!this.isDummy) {
                this.updateCarsPassed(dummyCars);
                this.sensor.update(borders);
                this.updateDamage(borders);
                const offsets = this.sensor.getRayValues().map(x => 1 - x);
                const out = NeuralNetwork.feedForward(offsets, this.brain);
                this.controls.applyInput(out);
            }
        }
    }
    /**
     * Updates number of dummy cars that have been passed by this car.
     *
     * @param dummyCars list of all dummy cars
     */
    updateCarsPassed(dummyCars) {
        this.carsPassed = 0;
        for (let car of dummyCars) {
            if (this.location.y < car.location.y) {
                this.carsPassed += 1;
            }
        }
    }
    /**
     * Updates car's damaged state to true if collision with obstacle
     * detected.
     *
     * @param borders of all obstacles to consider
     * @returns nothing if intersection found early
     */
    updateDamage(borders) {
        if (!this.damaged) {
            for (let corner of this.corners) {
                let line = new Border(this.location, corner);
                for (let border of borders) {
                    if (Intersect.getPercentUntilWall(line, border) >= 0) {
                        this.damaged = true;
                        return;
                    }
                }
            }
        }
    }
    /**
     * Move car's location based on speed and other factors.
     */
    moveCar() {
        if (Math.abs(this.speed) > 0) {
            if (this.controls.left) {
                this.angle -= this.rotationSpeed * Math.sign(-this.speed);
            }
            if (this.controls.right) {
                this.angle += this.rotationSpeed * Math.sign(-this.speed);
            }
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
    }
    /**
     * Updates car's corners based on location and angle of car.
     */
    updateCarCorners() {
        let corners = [];
        const radius = Math.hypot(this.width / 2, this.height / 2);
        const angle = Math.atan2(this.width, this.height);
        corners.push(new Coordinate(this.location.x - Math.sin(-this.angle - angle) * radius, this.location.y - Math.cos(-this.angle - angle) * radius));
        corners.push(new Coordinate(this.location.x - Math.sin(-this.angle + angle) * radius, this.location.y - Math.cos(-this.angle + angle) * radius));
        corners.push(new Coordinate(this.location.x - Math.sin(-this.angle - angle + Math.PI) * radius, this.location.y - Math.cos(-this.angle - angle + Math.PI) * radius));
        corners.push(new Coordinate(this.location.x - Math.sin(-this.angle + angle + Math.PI) * radius, this.location.y - Math.cos(-this.angle + angle + Math.PI) * radius));
        this.corners = corners;
    }
    /**
     * Updates car borders based on its corners.
     */
    updateCarBorders() {
        this.borders = [];
        for (let i = 0; i < this.corners.length; i++) {
            this.borders.push(new Border(this.corners[i], this.corners[(i + 1) % this.corners.length]));
        }
    }
    /**
     * Calculates car performance based on the following parameters
     * in descending order of importance:
     *
     * dummy cars passed, y distance traveled forward, no damaged
     */
    calculatePerformance() {
        let score = 0;
        let exponent = 1;
        let factors = 3;
        score += exponent * (this.damaged ? 0 : factors - 1);
        exponent *= factors;
        score += exponent * Math.min(factors - 1, Math.max(0, -this.location.y / 100, factors));
        exponent *= factors;
        score += this.carsPassed;
        this.score = score;
    }
}
