class Simulation {
    // localStorageKeys
    private readonly storageBrainKey = "bestBrain";
    private readonly storageScoreKey = "bestScore";
    private readonly storageDummies = "dummyCars";
    private readonly storageFail = "failCount";
    private readonly storageMutate = "mutationConstant";

    private readonly numSmartCars = 250;
    private readonly numDummyCars = 20;    
    private readonly startY = 0;
    private readonly dummyHeadStart = 200;
    private readonly laneCount = 3;
    private readonly startLane = 2;
    private readonly mutationGrowth = 0.02
    private readonly mutationConstant = 1.5;

    private smartCars : Car[] = [];
    private dummyCars : Car[] = [];

    constructor() {
        this.smartCars = this.generateSmartCars();
        this.dummyCars = this.generateDummyCars();
    }

    /**
     * If brain stored in localstorage from previous session, cars are generated
     * with the same brain but mutated by a mutation constant.
     * 
     * Else, cars are generated with random brains.
     * 
     * @returns List of smart cars with brains
     */
    private generateSmartCars() : Car[] {
        let cars : Car[] = [];

        for (let i = 0; i < this.numSmartCars; i++) {
            let brainText : string = localStorage.getItem(this.storageBrainKey);
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
        if (JSON.parse(localStorage.getItem(this.storageDummies)) == null) {
            this.createAndSaveDummyCars();
        }

        let cars : Car[] = [];
        const dummies : Car[] = JSON.parse(localStorage.getItem(this.storageDummies));

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

        localStorage.setItem(this.storageDummies,JSON.stringify(cars));
    }
    
    /**
     * Destroys localStorage. Use when program fails, usually due to user
     * manually changing values.
     */
    static destroyAll() : void {
        localStorage.clear();
    }
}