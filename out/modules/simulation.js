class Simulation {
    constructor(canvas) {
        // localStorageKeys
        this.storageBrainKey = "bestBrain";
        this.storageScoreKey = "bestScore";
        this.storageDummies = "dummyCars";
        this.storageFail = "failCount";
        this.storageMutate = "mutationConstant";
        this.numSmartCars = 250;
        this.numDummyCars = 20;
        this.startY = 0;
        this.dummyHeadStart = 200;
        this.laneCount = 3;
        this.startLane = 2;
        this.mutationGrowth = 0.02;
        this.mutationConstant = 1.5;
        this.timeLimit = 5;
        this.drawSensors = false;
        this.roadBorder = 10;
        this.timesUp = false;
        this.smartCars = [];
        this.dummyCars = [];
        this.smartCars = this.generateSmartCars();
        this.dummyCars = this.generateDummyCars();
        this.road = new Road(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width - this.roadBorder * 2, this.canvas.height * 100, this.laneCount);
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }
    /**
     * If brain stored in localstorage from previous session, cars are generated
     * with the same brain but mutated by a mutation constant.
     *
     * Else, cars are generated with random brains.
     *
     * @returns List of smart cars with brains
     */
    generateSmartCars() {
        let cars = [];
        for (let i = 0; i < this.numSmartCars; i++) {
            let brainText = localStorage.getItem(this.storageBrainKey);
            let brain = JSON.parse(brainText);
            if (i > 0 && brain) {
                NeuralNetwork.mutate(brain, this.mutationConstant);
            }
            let car = new Car(road.getLaneXval(this.startLane), this.startY, false, brain);
            cars.push(car);
        }
        return cars;
    }
    /**
     * If dummy cars stored in localStorage, load those dummies.
     *
     * Else create dummy cars, then load them.
     *
     * @returns List of dummy cars
     */
    generateDummyCars() {
        if (JSON.parse(localStorage.getItem(this.storageDummies)) == null) {
            this.createAndSaveDummyCars();
        }
        let cars = [];
        const dummies = JSON.parse(localStorage.getItem(this.storageDummies));
        for (let dummy of dummies) {
            cars.push(new Car(dummy.location.x, dummy.location.y, true));
        }
        return cars;
    }
    /**
     * Create "numDummyCars" dummy cars such that it is possible to pass
     * them.
     *
     */
    createAndSaveDummyCars() {
        let currY = this.startY - this.dummyHeadStart;
        let cars = [];
        let lanesTaken = [];
        for (let i = 0; i < this.numDummyCars; i++) {
            if (lanesTaken.length > Math.floor(this.laneCount / 4)) {
                currY -= 200;
                lanesTaken = [];
            }
            let lane = Math.floor((Math.random() * this.laneCount));
            while (lanesTaken.includes(lane)) {
                lane = (lane + 1) % this.laneCount;
            }
            lanesTaken.push(lane);
            cars.push(new Car(road.getLaneXval(lane + 1), currY));
        }
        localStorage.setItem(this.storageDummies, JSON.stringify(cars));
    }
    /**
     * Destroys localStorage. Use when program fails, usually due to user
     * manually changing values.
     */
    static destroyAll() {
        localStorage.clear();
    }
    /**
     * Starts simulation by setting a timer and calling the run function.
     */
    start() {
        this.setTimer();
        this.run();
    }
    /**
     * Sets timer after which timer status is updated.
     */
    setTimer() {
        setTimeout(() => this.timesUp = true, this.timeLimit * 1000);
    }
    /**
     * Runs simulation by updating canvas and status of all cars until
     * all smart cars are damaged or the timer runs out.
     */
    run() {
        this.smartCars.sort((a, b) => a.location.y - b.location.y);
        this.canvas.height = window.innerHeight;
        this.ctx.save();
        this.ctx.translate(0, -smartCars[0].location.y + this.canvas.height * 0.8);
        this.moveDummyCars();
        this.moveDrawSmartCars();
        this.road.draw(this.ctx);
        this.ctx.restore();
        if (this.areAllDead() || this.timesUp) {
            // this.saveBestBrain();
            // this.startAgain();
        }
        else {
            requestAnimationFrame(this.run);
        }
    }
    /**
     * Moves and draws all cars in this.dummyCars.
     */
    moveDummyCars() {
        for (let car of this.dummyCars) {
            car.update();
            car.draw(this.ctx, false);
        }
    }
    /**
     * @returns borders of walls and dummyCars
     */
    getBorders() {
        let borders = road.borders;
        for (let car of this.dummyCars) {
            borders = borders.concat(car.borders);
        }
        return borders;
    }
    /**
     * Moves and draws all cars in this.smartCars.
     */
    moveDrawSmartCars() {
        let borders = this.getBorders();
        let first = true;
        for (let car of this.smartCars) {
            car.update(borders, this.dummyCars);
            if (first) {
                car.draw(ctx, this.drawSensors);
                first = false;
            }
            else {
                car.draw(ctx, false);
            }
        }
    }
    /**
     * @returns true if all smart cars are damaged
     */
    areAllDead() {
        for (let car of this.smartCars) {
            if (!car.damaged) {
                return false;
            }
        }
        return true;
    }
}
