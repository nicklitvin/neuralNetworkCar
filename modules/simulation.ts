class Simulation {
    // localStorageKeys
    private readonly storageBrainKey = "bestBrain";
    private readonly storageScoreKey = "bestScore";
    private readonly storageDummiesKey = "dummyCars";
    private readonly storageFailKey = "failCount";
    private readonly storageMutateKey = "mutationConstant";

    private readonly numSmartCars = 250;
    private readonly numDummyCars = 20;    
    private readonly startY = 0;
    private readonly dummyHeadStart = 200;
    private readonly laneCount = 3;
    private readonly startLane = 2;
    private readonly mutationGrowth = 0.02
    private readonly mutationConstant = 1.5;
    private readonly timeLimit = 5;
    private readonly drawSensors = false;
    private readonly roadBorder = 10;
    private readonly restartOnFinish = false;
    
    private timesUp = false;
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private smartCars : Car[] = [];
    private dummyCars : Car[] = [];
    private road : Road;

    constructor(canvas : HTMLCanvasElement) {
        this.smartCars = this.generateSmartCars();
        this.dummyCars = this.generateDummyCars();
        this.road = new Road(
            this.canvas.width/2,
            this.canvas.height/2,
            this.canvas.width - this.roadBorder * 2,
            this.canvas.height * 100,
            this.laneCount
        );
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
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
                road.getLaneXval(this.startLane),this.startY,false,brain
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
     * 
     */
    private createAndSaveDummyCars() : void {
        let currY = this.startY - this.dummyHeadStart;
        let cars : Car[] = [];
        let lanesTaken : number[] = [];
    
        for (let i = 0; i < this.numDummyCars; i++) {
            if (lanesTaken.length > Math.floor(this.laneCount / 4)) {
                currY -= 200;
                lanesTaken = [];
            }
    
            let lane = Math.floor((Math.random()*this.laneCount));
            while (lanesTaken.includes(lane)) {
                lane = (lane + 1) % this.laneCount;
            }
            lanesTaken.push(lane);
    
            cars.push(new Car(road.getLaneXval(lane + 1),currY));
        }

        localStorage.setItem(this.storageDummiesKey,JSON.stringify(cars));
    }
    
    /**
     * Destroys localStorage. Use when program fails, usually due to user
     * manually changing values.
     */
    static destroyAll() : void {
        localStorage.clear();
    }

    /**
     * Starts simulation by setting a timer and calling the run function.
     */
    start() : void {
        this.setTimer();
        this.run();
    }

    /**
     * Sets timer after which timer status is updated.
     */
    private setTimer() : void {
        setTimeout( () => this.timesUp = true, this.timeLimit * 1000);
    }

    /**
     * Runs simulation by updating canvas and status of all cars until
     * all smart cars are damaged or the timer runs out.
     */
    private run () : void {
        this.smartCars.sort( (a,b) => a.location.y - b.location.y);
        this.canvas.height = window.innerHeight;
        this.ctx.save();
        this.ctx.translate(
            0,-smartCars[0].location.y + this.canvas.height * 0.8
        );

        this.moveDummyCars();
        this.moveDrawSmartCars();
        this.road.draw(this.ctx);
        this.ctx.restore();

        if (this.areAllDead() || this.timesUp) {
            this.saveBestBrain();
            if (this.restartOnFinish) {
                this.startAgain();
            }
        } else {
            requestAnimationFrame(this.run);
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
        let borders : Border[] = road.borders;
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
                car.draw(ctx,this.drawSensors);
                first = false;
            } else {
                car.draw(ctx,false);
            }
        }
    }

    /**
     * @returns true if all smart cars are damaged
     */
    private areAllDead() : boolean {
        for (let car of this.smartCars) {
            if (!car.damaged) {
                return false;
            }
        }
        return true;
    }

    /**
     * Saves best brain in current simulation if score is greater than the 
     * saved score. Also updates other parameters in storage for better
     * mutation process.
     */
    private saveBestBrain() : void {
        let highScore = localStorage.getItem(this.storageScoreKey);

        this.smartCars.forEach(car => car.calculatePerformance());
        this.smartCars.sort( (a,b) => b.score - a.score);

        if (!highScore || smartCars[0].score > Number(highScore)) {
            let bestBrain = JSON.stringify(smartCars[0].brain);
            let mutationConstant = String(this.mutationConstant / 2);

            localStorage.setItem(this.storageBrainKey,bestBrain);
            localStorage.setItem(this.storageMutateKey, mutationConstant);
            localStorage.setItem(STORAGE_FAIL,String(0));
        } else {
            let failCount = Number(
                localStorage.getItem(this.storageFailKey)
            );
            let newConstant = Math.min(
                MAX_MUTATE,
                MUTATE_CONSTANT * ( (1 + this.mutationGrowth) ** failCount)
            );
    
            localStorage.setItem(this.storageMutateKey, String(newConstant));
            localStorage.setItem(this.storageFailKey, String(failCount + 1));
        }
    
        localStorage.setItem(
            this.storageScoreKey, String(smartCars[0].score)
        );
    }


    /**
     * Refreshes page.
     */
    private startAgain() : void {
        location.reload();
    }
}