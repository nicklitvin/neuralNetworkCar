/**
 * Simulation class creates a simulation where smart cars
 * controlled by a neural network make decisions to pass as
 * many dummy cars on the road. The best results are saved
 * and improved upon with mutations to achieve the smartest
 * neural network.
 */
class Simulation {
    constructor(isSpeedRun, canvas) {
        // localStorageKeys
        this.storageBrainKey = "bestBrain";
        this.storageScoreKey = "bestScore";
        this.storageDummiesKey = "dummyCars";
        this.storageFailKey = "failCount";
        this.storageMutateKey = "mutationConstant";
        // adjustable values for fast develop
        this.defaultDummyYSeperation = 200;
        this.defaultMutationConstant = 1.5;
        this.defaultDummyRowFill = 0.4;
        // adjustable values
        this.numSmartCars = 100;
        this.startY = 0;
        this.mutationShrink = 0.5;
        this.mutationGrowth = 1.02;
        this.minMutationConstant = 0.1;
        this.maxMutationConstant = 3;
        this.progressCheckSec = 1.5;
        this.drawSensors = true;
        this.roadBorder = 10;
        this.restartOnFinish = false;
        this.continuouslyRun = true;
        this.carYRelativeToCanvas = 0.8;
        this.roadScreenLength = 50;
        this.improvementMin = 1.02;
        this.dummyDistanceShrink = 0.9;
        this.dummyCountGrowth = 1.5;
        this.completesToAddDifficulty = 2;
        this.completesToIncreaseRowFill = 30;
        this.carWidthToLaneWidth = 0.6;
        this.carHeightToLaneWidth = 0.9;
        // adjustable values
        this.startLane = 1;
        this.dummyYSeperation = 200;
        this.maxDummyRowFill = 0.4;
        this.speedMaxRuns = 60 * 20;
        this.laneCount = 8;
        this.numDummyCars = 10;
        this.dummyHeadStart = 200;
        this.timesUp = false;
        this.courseCompleted = false;
        this.lastTopScore = 0;
        this.isSpeedRun = false;
        this.speedRunsCounter = 0;
        this.smartCars = [];
        this.dummyCars = [];
        this.isSpeedRun = isSpeedRun;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.road = new Road(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width - this.roadBorder * 2, this.canvas.height * this.roadScreenLength, this.laneCount);
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
            let car = new Car(this.road.getLaneXval(this.startLane), this.startY, this.road.laneWidth * this.carWidthToLaneWidth, this.road.laneWidth * this.carHeightToLaneWidth, false, brain);
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
            let car = new Car(dummy.location.x, dummy.location.y, this.carWidthToLaneWidth * this.road.laneWidth, this.carHeightToLaneWidth * this.road.laneWidth, true);
            cars.push(car);
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
            if (lanesTaken.length + 1 > Math.floor(this.laneCount * this.maxDummyRowFill)) {
                currY -= this.dummyYSeperation;
                lanesTaken = [];
            }
            let lane = Math.floor((Math.random() * this.laneCount));
            while (lanesTaken.includes(lane)) {
                lane = (lane + 1) % this.laneCount;
            }
            lanesTaken.push(lane);
            let car = new Car(this.road.getLaneXval(lane + 1), currY, this.carWidthToLaneWidth * this.road.laneWidth, this.carHeightToLaneWidth * this.road.laneWidth);
            cars.push(car);
        }
        cars = cars.sort((a, b) => a.location.y - b.location.y);
        localStorage.setItem(this.storageDummiesKey, JSON.stringify(cars));
    }
    /**
     * Destroys localStorage. Use when program fails, usually due to user
     * manually changing values.
     */
    static destroyAll() {
        console.log("destroying data");
        setTimeout(() => {
            localStorage.clear();
            this.startAgain();
        }, 1000);
    }
    /**
     * Starts simulation by setting a timer and calling the run function.
     */
    start() {
        this.logStart();
        if (this.isSpeedRun) {
            while (this.speedRunsCounter < this.speedMaxRuns) {
                if (this.speedRunsCounter % 60 == 0) {
                    this.updateSimulationStatus();
                }
                if (this.timesUp)
                    break;
                this.run();
                this.speedRunsCounter++;
            }
            if (!this.timesUp) {
                this.timesUp = true;
            }
            this.run();
        }
        else {
            this.setTimer();
            this.run();
        }
    }
    /**
     * Sets timer that stops when cars are not making any progress
     * and alerts if no more progress can be made.
     */
    setTimer() {
        let timeInterval = this.progressCheckSec * 1000;
        setTimeout(() => this.updateSimulationStatus(), timeInterval);
    }
    updateSimulationStatus() {
        this.sortCarsByPerformance();
        let bestCar = this.smartCars[0];
        if (bestCar.carsPassed >= this.numDummyCars) {
            console.log("Course complete, create new road");
            this.courseCompleted = true;
            this.timesUp = true;
        }
        else if (bestCar.score > this.lastTopScore * this.improvementMin) {
            this.lastTopScore = bestCar.score;
            if (!this.isSpeedRun)
                this.setTimer();
        }
        else {
            this.timesUp = true;
        }
    }
    /**
     * Runs simulation by updating canvas and status of all cars until
     * all smart cars are damaged or the timer runs out. If
     * this.startAgain is true, starts the simulation again.
     */
    run() {
        this.smartCars.sort((a, b) => a.location.y - b.location.y);
        if (!this.isSpeedRun) {
            this.canvas.height = window.innerHeight;
            this.ctx.save();
            this.ctx.translate(0, -this.smartCars[0].location.y +
                this.canvas.height * this.carYRelativeToCanvas);
        }
        this.moveDrawDummyCars();
        this.moveDrawSmartCars();
        if (!this.isSpeedRun) {
            this.road.draw(this.ctx);
            this.ctx.restore();
        }
        if (this.timesUp) {
            this.resolveSimulation();
            this.logResults();
            if (this.isSpeedRun)
                return;
            else if (this.restartOnFinish) {
                Simulation.startAgain();
            }
        }
        else if (this.continuouslyRun && !this.isSpeedRun) {
            requestAnimationFrame(this.run.bind(this));
        }
    }
    /**
     * Moves and draws all cars in this.dummyCars.
     */
    moveDrawDummyCars() {
        for (let car of this.dummyCars) {
            car.update();
            if (!this.isSpeedRun)
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
                if (!this.isSpeedRun)
                    car.draw(this.ctx, this.drawSensors);
                first = false;
            }
            else {
                if (!this.isSpeedRun)
                    car.draw(this.ctx, false);
            }
        }
    }
    /**
     * If best score in this simulation is greater than the saved high
     * score, updates saved brain.
     *
     * Else increases mutation constant.
     */
    resolveSimulation() {
        this.sortCarsByPerformance();
        let highScore = Number(localStorage.getItem(this.storageScoreKey));
        let scoreToBeat = Number(highScore) * this.improvementMin;
        let bestScore = this.smartCars[0].score;
        if (highScore != null && bestScore < scoreToBeat &&
            !this.courseCompleted) {
            this.increaseMutationConstant();
        }
        else {
            this.saveBestBrain();
        }
        localStorage.setItem(this.storageScoreKey, String(this.smartCars[0].score));
    }
    /**
     * Reduces mutation constant and saves brain with other variables to
     * localstorage.
     */
    saveBestBrain() {
        console.log("saving best brain");
        let bestBrain = JSON.stringify(this.smartCars[0].brain);
        let mutationConstant = this.mutationConstant * this.mutationShrink;
        if (mutationConstant < this.minMutationConstant) {
            mutationConstant = this.defaultMutationConstant;
            console.log("mutation constant too low, reseting value");
        }
        localStorage.setItem(this.storageBrainKey, bestBrain);
        localStorage.setItem(this.storageMutateKey, String(mutationConstant));
        localStorage.setItem(this.storageFailKey, String(0));
    }
    /**
     * Increases mutation constant depending on growth constant and
     * number of consecutive failures to progress, but resets to
     * default when greater than the max allowed value. Saves
     * constant and fails to localstorage.
     */
    increaseMutationConstant() {
        console.log("not enough improvement, increasing mutation");
        let failCount = Number(localStorage.getItem(this.storageFailKey));
        let newConstant = this.mutationConstant * (this.mutationGrowth ** failCount);
        if (newConstant > this.maxMutationConstant) {
            newConstant = this.defaultMutationConstant;
            console.log("mutation constant too high, reseting value");
        }
        localStorage.setItem(this.storageMutateKey, String(newConstant));
        localStorage.setItem(this.storageFailKey, String(failCount + 1));
    }
    /**
     * Refreshes page.
     */
    static startAgain() {
        location.reload();
    }
    /**
     * Create and save a traffic arrangement to local storage.
     * Reset best score for next map.
     */
    newRoad() {
        this.createAndSaveDummyCars();
        localStorage.setItem(this.storageScoreKey, String(0));
        localStorage.setItem(this.storageMutateKey, String(this.defaultMutationConstant));
        console.log("new road created");
        setTimeout(() => Simulation.startAgain(), 1000);
    }
    /**
     * Logs initial data.
     */
    logStart() {
        console.log("==============");
        console.log("mutation constant: ", this.mutationConstant);
        console.log("previous best score: ", localStorage.getItem(this.storageScoreKey));
        console.log("failure streak: ", localStorage.getItem(this.storageFailKey));
    }
    /**
     * Logs results of simulation.
     */
    logResults() {
        console.log("new mutation constant: ", localStorage.getItem(this.storageMutateKey));
        console.log("current best score: ", this.smartCars[0].score);
        console.log("failure streak: ", localStorage.getItem(this.storageFailKey));
        console.log("==============");
    }
    /**
     * Sort cars by performance and save order. Cars passed is
     * the most important attribute in scoring.
     */
    sortCarsByPerformance() {
        this.smartCars.forEach(car => car.calculatePerformance(this.dummyCars));
        this.smartCars.sort((a, b) => b.score - a.score);
    }
    /**
     * Runs simulation many times, gradually increasing difficulty.
     * Brain is saved to localstorage as usual.
     *
     * @param canvas for proper visuals after development
     */
    static speedBrainDevelopment(canvas) {
        let cycle = 0;
        while (cycle < Simulation.brainDevelopmentCycles) {
            console.log("CYCLE", cycle);
            let simulation = new Simulation(true, canvas);
            if (cycle == 0 && !this.speedBruteForceRoad)
                simulation.newRoad();
            simulation.start();
            if (simulation.courseCompleted) {
                Simulation.speedCompletes++;
                if (Simulation.speedCompletes %
                    simulation.completesToAddDifficulty == 0) {
                    simulation.increaseDifficulty();
                }
                simulation.newRoad();
            }
            cycle++;
        }
        console.log("fast develop complete");
        console.log(`courses completed: ${Simulation.speedCompletes}`);
        Simulation.speedCompletes = 0;
    }
    /**
     * Increases difficulty of new road based on complete count.
     */
    increaseDifficulty() {
        if (Simulation.speedCompletes %
            this.completesToIncreaseRowFill == 0) {
            let newFill = this.maxDummyRowFill + 1 / this.laneCount;
            if (newFill < 1) {
                this.maxDummyRowFill += 1 / this.laneCount;
                this.dummyYSeperation = this.defaultDummyYSeperation *
                    this.maxDummyRowFill * this.laneCount;
            }
            else {
                this.laneCount += 1;
                this.maxDummyRowFill = this.defaultDummyRowFill;
                this.dummyYSeperation = this.defaultDummyYSeperation;
            }
        }
        else {
            let choices = 3;
            let choice = Math.floor(Math.random() * choices - 0.001);
            switch (choice) {
                case 0: {
                    this.startLane = (this.startLane + 1) & this.laneCount;
                    break;
                }
                case 1: {
                    this.dummyYSeperation *= this.dummyDistanceShrink;
                    break;
                }
                case 2: {
                    this.numDummyCars *= this.dummyCountGrowth;
                    this.speedMaxRuns *= this.dummyCountGrowth;
                    break;
                }
            }
        }
    }
}
Simulation.speedCompletes = 0;
Simulation.brainDevelopmentCycles = 50;
Simulation.speedBruteForceRoad = true;
