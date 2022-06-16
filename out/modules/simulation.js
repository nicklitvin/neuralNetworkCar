class Simulation {
    constructor() {
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
        this.smartCars = [];
        this.dummyCars = [];
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
}
