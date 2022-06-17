/**
 * Simulation class creates a simulation where smart cars
 * controlled by a neural network make decisions to pass as
 * many dummy cars on the road. The best results are saved
 * and improved upon with mutations to achieve the smartest
 * neural network.
 */
class Simulation {
    // localStorageKeys
    private readonly storageBrainKey = "bestBrain";
    private readonly storageScoreKey = "bestScore";
    private readonly storageDummiesKey = "dummyCars";
    private readonly storageFailKey = "failCount";
    private readonly storageMutateKey = "mutationConstant";

    // adjustable values for fast develop
    private readonly defaultDummyYSeperation = 200;
    private readonly defaultMutationConstant = 1.5;
    private readonly defaultDummyRowFill = 0.4;

    // adjustable values
    private readonly numSmartCars = 100;
    private readonly startY = 0;
    private readonly mutationShrink = 0.5;
    private readonly mutationGrowth = 1.02;
    private readonly minMutationConstant = 0.05;
    private readonly maxMutationConstant = 5;
    private readonly progressCheckSec = 1.5;
    private readonly drawSensors = false;
    private readonly roadBorder = 10;
    private readonly restartOnFinish = false;
    private readonly continuouslyRun = true;
    private readonly carYRelativeToCanvas = 0.8;
    private readonly roadScreenLength = 50;
    private readonly improvementMin = 1.02;
    private readonly dummyDistanceShrink = 0.9;
    private readonly dummyCountGrowth = 1.5;
    private readonly completesToAddDifficulty = 2;
    private readonly completesToIncreaseRowFill = 30; 

    // adjustable values
    private startLane = 2;
    private dummyYSeperation = 200;
    private maxDummyRowFill = 0.4;
    private speedMaxRuns = 60*20;
    private laneCount = 3;
    private numDummyCars = 10;    
    private dummyHeadStart = 200;
    
    private static readonly brainDevelopmentCycles = 100;

    private timesUp = false;
    private courseCompleted = false;
    private lastTopScore = 0;
    private isSpeedRun = false;
    private speedRunsCounter = 0;
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private smartCars : Car[] = [];
    private dummyCars : Car[] = [];
    private road : Road;
    private mutationConstant : number;

    constructor(isSpeedRun : boolean, canvas : HTMLCanvasElement) {
        this.isSpeedRun = isSpeedRun;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.road = new Road(
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width - this.roadBorder * 2,
            this.canvas.height * this.roadScreenLength,
            this.laneCount
        );

        this.mutationConstant = this.defaultMutationConstant;
        let savedMutationConstant = localStorage.getItem(
            this.storageMutateKey
        );
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
    private generateSmartCars() : Car[] {
        let cars : Car[] = [];

        for (let i = 0; i < this.numSmartCars; i++) {
            let brainText = localStorage.getItem(this.storageBrainKey);
            let brain : NeuralNetwork = JSON.parse(brainText);
            
            if (i > 0 && brain) {
                NeuralNetwork.mutate(brain,this.mutationConstant);
            }
            let car = new Car(
                this.road.getLaneXval(this.startLane),
                this.startY,false,brain
            );
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
    private generateDummyCars() : Car[] {
        if (JSON.parse(
            localStorage.getItem(this.storageDummiesKey)) == null) 
        {
            this.createAndSaveDummyCars();
        }

        let cars : Car[] = [];
        let dummiesText = localStorage.getItem(this.storageDummiesKey);
        const dummies : Car[] = JSON.parse(dummiesText);

        for (let dummy of dummies) {
            cars.push(new Car(dummy.location.x,dummy.location.y,true));    
        }
        return cars;
    }

    /**
     * Create "numDummyCars" dummy cars such that it is possible to pass
     * them.
     */
    private createAndSaveDummyCars() : void {
        let currY = this.startY - this.dummyHeadStart;
        let cars : Car[] = [];
        let lanesTaken : number[] = [];
    
        for (let i = 0; i < this.numDummyCars; i++) {
            
            if (lanesTaken.length + 1 > Math.floor(
                this.laneCount * this.maxDummyRowFill))
            {
                currY -= this.dummyYSeperation;
                lanesTaken = [];
            }
    
            let lane = Math.floor((Math.random()*this.laneCount));
            while (lanesTaken.includes(lane)) {
                lane = (lane + 1) % this.laneCount;
            }
            lanesTaken.push(lane);
    
            cars.push(new Car(this.road.getLaneXval(lane + 1),currY));
        }

        cars = cars.sort( (a,b) => a.location.y - b.location.y);

        localStorage.setItem(this.storageDummiesKey,JSON.stringify(cars));
    }
    
    /**
     * Destroys localStorage. Use when program fails, usually due to user
     * manually changing values.
     */
    public static destroyAll() : void {
        console.log("destroying data");
        setTimeout( () => {
            localStorage.clear();
            this.startAgain();
        }, 1000)
    }

    /**
     * Starts simulation by setting a timer and calling the run function.
     */
    public start() : void {
        this.logStart();
        if (this.isSpeedRun) {
            while (this.speedRunsCounter < this.speedMaxRuns){
                if (this.speedRunsCounter % 60 == 0) {
                    this.updateSimulationStatus();
                }
                if (this.timesUp) break;
                this.run();
                this.speedRunsCounter++;
            }
            if (!this.timesUp) {
                this.timesUp = true;
            }
            this.run();
        } else {
            this.setTimer();
            this.run();
        }
    }

    /**
     * Sets timer that stops when cars are not making any progress
     * and alerts if no more progress can be made.
     */
    private setTimer() : void {
        let timeInterval = this.progressCheckSec * 1000;
        setTimeout( () => this.updateSimulationStatus(),timeInterval);
    }

    private updateSimulationStatus() : void {
        this.sortCarsByPerformance();
        let bestCar = this.smartCars[0];

        if (bestCar.carsPassed == this.numDummyCars) {
            console.log("Course complete, create new road");
            this.courseCompleted = true;
            this.timesUp = true;
        } else if (
            bestCar.score > this.lastTopScore * this.improvementMin) 
        {
            this.lastTopScore = bestCar.score;
            if (!this.isSpeedRun) this.setTimer();
        } else {
            this.timesUp = true
        }
    }

    /**
     * Runs simulation by updating canvas and status of all cars until
     * all smart cars are damaged or the timer runs out. If 
     * this.startAgain is true, starts the simulation again.
     */
    private run () : void {
        this.smartCars.sort( (a,b) => a.location.y - b.location.y);
        if (!this.isSpeedRun) {
            this.canvas.height = window.innerHeight;
            this.ctx.save();
            this.ctx.translate(
                0,
                -this.smartCars[0].location.y +
                this.canvas.height * this.carYRelativeToCanvas
            );
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

            if (this.isSpeedRun) return;
            else if (this.restartOnFinish) {
                Simulation.startAgain();
            }
        } else if (this.continuouslyRun && !this.isSpeedRun) {
            requestAnimationFrame(this.run.bind(this));
        }
    }

    /**
     * Moves and draws all cars in this.dummyCars.
     */
    private moveDrawDummyCars() : void {
        for (let car of this.dummyCars) {
            car.update();
            if (!this.isSpeedRun) car.draw(this.ctx,false);
        }
    }

    /**
     * @returns borders of walls and dummyCars
     */
    private getBorders() : Border[] {
        let borders : Border[] = this.road.borders;
        for (let car of this.dummyCars) {
            borders = borders.concat(car.borders);
        }
        return borders;
    }

    /**
     * Moves and draws all cars in this.smartCars.
     */
    private moveDrawSmartCars() : void {
        let borders = this.getBorders();
        let first = true;

        for (let car of this.smartCars) {
            car.update(borders,this.dummyCars);
    
            if (first) {
                if (!this.isSpeedRun) car.draw(this.ctx,this.drawSensors);
                first = false;
            } else {
                if (!this.isSpeedRun) car.draw(this.ctx,false);
            }
        }
    }

    /**
     * If best score in this simulation is greater than the saved high
     * score, updates saved brain.
     * 
     * Else increases mutation constant.
     */
    private resolveSimulation() : void {
        this.sortCarsByPerformance();

        let highScore = Number(localStorage.getItem(this.storageScoreKey));
        let scoreToBeat = Number(highScore) * this.improvementMin;
        let bestScore = this.smartCars[0].score;

        if (highScore != null && bestScore < scoreToBeat &&
            !this.courseCompleted) 
        {
            this.increaseMutationConstant();
        } else {
            this.saveBestBrain();
        }
    
        localStorage.setItem(
            this.storageScoreKey, String(this.smartCars[0].score)
        );
    }

    /**
     * Reduces mutation constant and saves brain with other variables to
     * localstorage.
     */
    private saveBestBrain() : void {
        console.log("saving best brain");
        let bestBrain = JSON.stringify(this.smartCars[0].brain);
        let mutationConstant = this.mutationConstant * this.mutationShrink;
        if (mutationConstant < this.minMutationConstant) {
            mutationConstant = this.defaultMutationConstant;
            console.log("mutation constant too low, reseting value");
        }

        localStorage.setItem(this.storageBrainKey,bestBrain);
        localStorage.setItem(
            this.storageMutateKey,
            String(mutationConstant)
        );
        localStorage.setItem(this.storageFailKey,String(0));
    }

    /**
     * Increases mutation constant depending on growth constant and 
     * number of consecutive failures to progress, but resets to 
     * default when greater than the max allowed value. Saves
     * constant and fails to localstorage.
     */
    private increaseMutationConstant() : void {
        console.log("not enough improvement, increasing mutation");
        let failCount = Number(
            localStorage.getItem(this.storageFailKey)
        );
        let newConstant = this.mutationConstant * (
                this.mutationGrowth ** failCount
        );
        if (newConstant > this.maxMutationConstant) {
            newConstant = this.defaultMutationConstant;
            console.log("mutation constant too high, reseting value");
        }

        localStorage.setItem(this.storageMutateKey,
            String(newConstant)
        );
        localStorage.setItem(this.storageFailKey,
            String(failCount + 1)
        );
    }

    /**
     * Refreshes page.
     */
    public static startAgain() : void {
        location.reload();
    }

    /**
     * Create and save a traffic arrangement to local storage.
     * Reset best score for next map.
     */
    public newRoad() : void {
        this.createAndSaveDummyCars();
        localStorage.setItem(this.storageScoreKey,String(0));
        localStorage.setItem(
            this.storageMutateKey,
            String(this.defaultMutationConstant)
        );
        console.log("new road created");
    }

    /**
     * Logs initial data.
     */
    private logStart() : void {
        console.log("mutation constant: ", this.mutationConstant);
        console.log("previous best score: ", 
            localStorage.getItem(this.storageScoreKey)
        );
        console.log("failure streak: ", 
            localStorage.getItem(this.storageFailKey)
        );
        console.log("==============")
    }

    /**
     * Logs results of simulation.
     */
    private logResults() : void {
        console.log("==============")
        console.log("current best score: ", this.smartCars[0].score);
        console.log("new mutation constant: ", 
            localStorage.getItem(this.storageMutateKey)
        );
        console.log("failure streak: ", 
            localStorage.getItem(this.storageFailKey)
        );
    }

    /**
     * Sort cars by performance and save order. Cars passed is
     * the most important attribute in scoring.
     */
    private sortCarsByPerformance() : void {
        this.smartCars.forEach(car => car.calculatePerformance(
            this.dummyCars
        ));
        this.smartCars.sort( (a,b) => b.score - a.score);
    }

    /**
     * Runs simulation many times, gradually increasing difficulty.
     * Brain is saved to localstorage as usual. 
     * 
     * @param canvas for proper visuals after development
     */
    public static speedBrainDevelopment (
        canvas : HTMLCanvasElement) : void 
    {
        let cycle = 0;
        let coursesCompleted = 0;

        while (cycle < Simulation.brainDevelopmentCycles) {
            console.log("CYCLE",cycle);
            let simulation = new Simulation(true,canvas);
            simulation.start();
            if (simulation.courseCompleted) {
                coursesCompleted++;
                if (coursesCompleted %
                    simulation.completesToAddDifficulty == 0) 
                {
                    simulation.increaseDifficulty(coursesCompleted);
                }
                simulation.newRoad();
            } 
            cycle++;
        }
    }

    /**
     * Increases difficulty of new road based on complete count.
     */
    private increaseDifficulty(completed : number) : void {
        if (completed % this.completesToIncreaseRowFill == 0) {
            let newFill = this.maxDummyRowFill + 1 / this.laneCount;
            if (newFill < 1) {
                this.maxDummyRowFill += 1 / this.laneCount;
                this.dummyYSeperation = this.defaultDummyYSeperation * 
                    this.maxDummyRowFill * this.laneCount;
            } else {
                this.laneCount += 1;
                this.maxDummyRowFill = this.defaultDummyRowFill;
                this.dummyYSeperation = this.defaultDummyYSeperation;
            }
        } else {
            let choices = 3;
            let choice = Math.floor(Math.random() * choices - 0.001);
            switch(choice) {
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