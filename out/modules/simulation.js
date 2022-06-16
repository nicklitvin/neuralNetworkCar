/**
 * Simulation class creates a simulation where smart cars
 * controlled by a neural network make decisions to pass as
 * many dummy cars on the road. The best results are saved
 * and improved upon with mutations to achieve the smartest
 * neural network.
 */
class Simulation {
    constructor(canvas) {
        // localStorageKeys
        this.storageBrainKey = "bestBrain";
        this.storageScoreKey = "bestScore";
        this.storageDummiesKey = "dummyCars";
        this.storageFailKey = "failCount";
        this.storageMutateKey = "mutationConstant";
        // adjustable values
        this.numSmartCars = 250;
        this.numDummyCars = 20;
        this.startY = 0;
        this.dummyHeadStart = 200;
        this.laneCount = 3;
        this.startLane = 2;
        this.mutationGrowth = 0.02;
        this.defaultMutationConstant = 1.5;
        this.timeLimit = 10;
        this.drawSensors = false;
        this.roadBorder = 10;
        this.restartOnFinish = false;
        this.continuouslyRun = true;
        this.maxDummyRowFill = 0.5;
        this.carYRelativeToCanvas = 0.8;
        this.timesUp = false;
        this.smartCars = [];
        this.dummyCars = [];
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.road = new Road(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width - this.roadBorder * 2, this.canvas.height * 100, this.laneCount);
        this.mutationConstant = this.defaultMutationConstant;
        let savedMutationConstant = localStorage.getItem(this.storageMutateKey);
        if (savedMutationConstant) {
            this.mutationConstant = Number(savedMutationConstant);
        }
        this.smartCars = this.generateSmartCars();
        this.dummyCars = this.generateDummyCars();
    }
    /**
     * If brain stored in localstorage from previous session, cars are
     * generated with the same brain but mutated by a mutation constant.
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
            let car = new Car(this.road.getLaneXval(this.startLane), this.startY, false, brain);
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
        if (JSON.parse(localStorage.getItem(this.storageDummiesKey)) == null) {
            this.createAndSaveDummyCars();
        }
        let cars = [];
        let dummiesText = localStorage.getItem(this.storageDummiesKey);
        const dummies = JSON.parse(dummiesText);
        for (let dummy of dummies) {
            cars.push(new Car(dummy.location.x, dummy.location.y, true));
        }
        return cars;
    }
    /**
     * Create "numDummyCars" dummy cars such that it is possible to pass
     * them.
     */
    createAndSaveDummyCars() {
        let currY = this.startY - this.dummyHeadStart;
        let cars = [];
        let lanesTaken = [];
        for (let i = 0; i < this.numDummyCars; i++) {
            if (lanesTaken.length > Math.floor(this.laneCount * this.maxDummyRowFill)) {
                currY -= 200;
                lanesTaken = [];
            }
            let lane = Math.floor((Math.random() * this.laneCount));
            while (lanesTaken.includes(lane)) {
                lane = (lane + 1) % this.laneCount;
            }
            lanesTaken.push(lane);
            cars.push(new Car(this.road.getLaneXval(lane + 1), currY));
        }
        localStorage.setItem(this.storageDummiesKey, JSON.stringify(cars));
    }
    /**
     * Destroys localStorage. Use when program fails, usually due to user
     * manually changing values.
     */
    static destroyAll() {
        localStorage.clear();
        startAgain();
    }
    /**
     * Starts simulation by setting a timer and calling the run function.
     */
    start() {
        this.logStart();
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
     * all smart cars are damaged or the timer runs out. If
     * this.startAgain is true, starts the simulation again.
     */
    run() {
        this.smartCars.sort((a, b) => a.location.y - b.location.y);
        this.canvas.height = window.innerHeight;
        this.ctx.save();
        this.ctx.translate(0, -this.smartCars[0].location.y +
            this.canvas.height * this.carYRelativeToCanvas);
        this.moveDummyCars();
        this.moveDrawSmartCars();
        this.road.draw(this.ctx);
        this.ctx.restore();
        if (this.areAllDead() || this.timesUp) {
            this.saveBestBrain();
            this.logResults();
            if (this.restartOnFinish) {
                this.startAgain();
            }
        }
        else if (this.continuouslyRun) {
            requestAnimationFrame(this.run.bind(this));
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
        let borders = this.road.borders;
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
                car.draw(this.ctx, this.drawSensors);
                first = false;
            }
            else {
                car.draw(this.ctx, false);
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
    /**
     * Saves best brain in current simulation to local storage if score
     * is greater than the saved score. Also updates other parameters
     * in storage for better mutation process.
     */
    saveBestBrain() {
        let highScore = localStorage.getItem(this.storageScoreKey);
        this.smartCars.forEach(car => car.calculatePerformance());
        this.smartCars.sort((a, b) => b.score - a.score);
        if (!highScore || this.smartCars[0].score > Number(highScore)) {
            let bestBrain = JSON.stringify(this.smartCars[0].brain);
            let mutationConstant = String(this.mutationConstant / 2);
            localStorage.setItem(this.storageBrainKey, bestBrain);
            localStorage.setItem(this.storageMutateKey, mutationConstant);
            localStorage.setItem(this.storageFailKey, String(0));
        }
        else {
            let failCount = Number(localStorage.getItem(this.storageFailKey));
            let newConstant = this.mutationConstant * ((1 + this.mutationGrowth) ** failCount);
            localStorage.setItem(this.storageMutateKey, String(newConstant));
            localStorage.setItem(this.storageFailKey, String(failCount + 1));
        }
        localStorage.setItem(this.storageScoreKey, String(this.smartCars[0].score));
    }
    /**
     * Refreshes page.
     */
    startAgain() {
        location.reload();
    }
    /**
     * Create and save a traffic arrangement to local storage
     */
    newRoad() {
        let dummies = this.generateDummyCars();
        localStorage.setItem(this.storageDummiesKey, JSON.stringify(dummies));
        this.startAgain();
    }
    /**
     * Logs initial data.
     */
    logStart() {
        console.log("mutation constant: ", this.mutationConstant);
        console.log("previous score: ", localStorage.getItem(this.storageScoreKey));
        console.log("failure streak: ", localStorage.getItem(this.storageFailKey));
    }
    /**
     * Logs results of simulation.
     */
    logResults() {
        console.log("==============");
        console.log("currScore: ", this.smartCars[0].score);
        console.log("new Mutation Score: ", this.mutationConstant);
        console.log("failure streak: ", localStorage.getItem(this.storageFailKey));
    }
}
