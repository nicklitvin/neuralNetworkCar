class NeuronLevel {
    protected inputNodes : number[];
    protected outputNodes : number[];
    protected outputThresh : number[];
    protected weights : number[][] = [];
    
    private static maxVal = 3;

    constructor(inputNum : number, outputNum : number) {
        this.inputNodes = new Array(inputNum);
        this.outputNodes = new Array(outputNum);
        this.outputThresh = new Array(outputNum);

        for (let i = 0; i < inputNum; i++) {
            this.weights.push(new Array(outputNum));
        }
        NeuronLevel.randomize(this);
    }

    static randomize(level : NeuronLevel) : void {
        for (let i = 0; i < level.inputNodes.length; i++) {
            for (let j = 0; j < level.outputNodes.length; j++) {
                level.weights[i][j] = Math.random()*2 - 1;
            }
        }
        for (let j = 0; j < level.outputNodes.length; j++) {
            level.outputThresh[j] = Math.random()*2 - 1;
        }
    }

    static feedForward(inputVals : number[], level : NeuronLevel) : number[] {
        for (let i = 0; i < level.inputNodes.length; i++) {
            level.inputNodes[i] = inputVals[i];
        }

        for (let j = 0; j < level.outputNodes.length; j++) {
            let sum : number = 0;
            for (let i = 0; i < level.inputNodes.length; i++) {
                sum += level.inputNodes[i] * level.weights[i][j];
            }
            level.outputNodes[j] = 0;
            
            if (sum >= level.outputThresh[j]) {
                level.outputNodes[j] = 1;
            } 
        }
        return level.outputNodes;
    }

    static mutateOutputThresh(level : NeuronLevel, constant : number) : void {
        for (let i = 0; i < level.outputThresh.length; i++) {
            level.outputThresh[i] += (Math.random() * 2 - 1) * constant;
            level.outputThresh[i] = this.normalizeValue(level.outputThresh[i]);
        }
    }
    
    static mutateWeights(level : NeuronLevel, constant : number) : void {
        for (let i = 0; i < level.weights.length; i++) {
            for (let j = 0; j < level.weights[i].length; j++) {
                level.weights[i][j] += (Math.random() * 2 - 1) * constant;
                level.weights[i][j] = this.normalizeValue(level.weights[i][j]);
            }
        }
    }

    static normalizeValue(val : number) : number {
        return Math.min(
            this.maxVal,
            Math.max(-1 * this.maxVal, val)
        )
    }
}