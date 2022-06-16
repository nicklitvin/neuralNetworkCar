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

    // adjustable values
    private readonly numSmartCars = 750;
    private readonly numDummyCars = 10;    
    private readonly startY = 0;
    private readonly dummyHeadStart = 200;
    private readonly laneCount = 3;
    private readonly startLane = 2;
    private readonly mutationShrink = 0.5;
    private readonly mutationGrowth = 0.02
    private readonly defaultMutationConstant = 1.5;
    private readonly progressCheckSec = 1.5;
    private readonly drawSensors = false;
    private readonly roadBorder = 10;
    private readonly restartOnFinish = false;
    private readonly continuouslyRun = true;
    private readonly maxDummyRowFill = 0.3;
    private readonly carYRelativeToCanvas = 0.8;
    private readonly dummySeparationY = 200;
    private readonly roadScreenLength = 50;
    
    private timesUp = false;
    private courseCompleted = false;
    private lastTopScore = 0;
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private smartCars : Car[] = [];
    private dummyCars : Car[] = [];
    private road : Road;
    private mutationConstant : number;

    constructor(canvas : HTMLCanvasElement) {
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
            
            if (lanesTaken.length > Math.floor(
                this.laneCount * this.maxDummyRowFill))
            {
                currY -= this.dummySeparationY;
                lanesTaken = [];
            }
    
            let lane = Math.floor((Math.random()*this.laneCount));
            while (lanesTaken.includes(lane)) {
                lane = (lane + 1) % this.laneCount;
            }
            lanesTaken.push(lane);
    
            cars.push(new Car(this.road.getLaneXval(lane + 1),currY));
        }

        localStorage.setItem(this.storageDummiesKey,JSON.stringify(cars));
    }
    
    /**
     * Destroys localStorage. Use when program fails, usually due to user
     * manually changing values.
     */
    static destroyAll() : void {
        localStorage.clear();
        startAgain();
    }

    /**
     * Starts simulation by setting a timer and calling the run function.
     */
    start() : void {
        this.logStart();
        this.setTimer();
        this.run();
    }

    /**
     * Sets timer that stops when cars are not making any progress
     * and alerts if no more progress can be made.
     */
    private setTimer() : void {
        setTimeout( () => {
            this.sortCarsByPerformance();
            let bestCar = this.smartCars[0];

            if (bestCar.carsPassed == this.numDummyCars) {
                console.log("Course complete, create new road");
                this.courseCompleted = true;
                // localStorage.setItem(this.storageFailKey,String(-1));
                this.timesUp = true;
            } else if (bestCar.score > this.lastTopScore) {
                this.lastTopScore = bestCar.score;
                this.setTimer();
            } else {
                this.timesUp = true 
            }
        }, this.progressCheckSec * 1000);
    }

    /**
     * Runs simulation by updating canvas and status of all cars until
     * all smart cars are damaged or the timer runs out. If 
     * this.startAgain is true, starts the simulation again.
     */
    private run () : void {
        this.smartCars.sort( (a,b) => a.location.y - b.location.y);
        this.canvas.height = window.innerHeight;
        this.ctx.save();
        this.ctx.translate(
            0,
            -this.smartCars[0].location.y +
            this.canvas.height * this.carYRelativeToCanvas
        );

        this.moveDummyCars();
        this.moveDrawSmartCars();
        this.road.draw(this.ctx);
        this.ctx.restore();

        if (this.timesUp) {
            this.saveBestBrain();
            this.logResults();

            if (this.restartOnFinish) {
                this.startAgain();
            }
        } else if (this.continuouslyRun) {
            requestAnimationFrame(this.run.bind(this));
        }
    }

    /**
     * Moves and draws all cars in this.dummyCars.
     */
    private moveDummyCars() : void {
        for (let car of this.dummyCars) {
            car.update();
            car.draw(this.ctx,false);
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
                car.draw(this.ctx,this.drawSensors);
                first = false;
            } else {
                car.draw(this.ctx,false);
            }
        }
    }

    /**
     * Saves best brain in current simulation to local storage if score
     * is greater than the saved score. Also updates other parameters
     * in storage for better mutation process.
     */
    private saveBestBrain() : void {
        let highScore = localStorage.getItem(this.storageScoreKey);
        this.sortCarsByPerformance();

        if (
            !highScore ||
            this.smartCars[0].score > Number(highScore) ||
            this.courseCompleted) 
        {
            let bestBrain = JSON.stringify(this.smartCars[0].brain);
            let mutationConstant = 
                String(this.mutationConstant * this.mutationShrink
            );

            localStorage.setItem(this.storageBrainKey,bestBrain);
            localStorage.setItem(this.storageMutateKey, mutationConstant);
            localStorage.setItem(this.storageFailKey,String(0));
        } else {
            let failCount = Number(
                localStorage.getItem(this.storageFailKey)
            );
            let newConstant = this.mutationConstant * (
                    (1 + this.mutationGrowth) ** failCount
            );
    
            localStorage.setItem(this.storageMutateKey,
                String(newConstant)
            );
            localStorage.setItem(this.storageFailKey,
                String(failCount + 1)
            );
        }
    
        localStorage.setItem(
            this.storageScoreKey, String(this.smartCars[0].score)
        );
    }


    /**
     * Refreshes page.
     */
    public startAgain() : void {
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
        this.startAgain();
    }

    /**
     * Logs initial data.
     */
    private logStart() : void {
        console.log("mutation constant: ", this.mutationConstant);
        console.log("previous score: ", 
            localStorage.getItem(this.storageScoreKey)
        );
        console.log("failure streak: ", 
            localStorage.getItem(this.storageFailKey)
        );
    }

    /**
     * Logs results of simulation.
     */
    private logResults() : void {
        console.log("==============")
        console.log("currScore: ", this.smartCars[0].score);
        console.log("new Mutation Score: ", 
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
        this.smartCars.forEach(car => car.calculatePerformance());
        this.smartCars.sort( (a,b) => b.score - a.score);
    }
}