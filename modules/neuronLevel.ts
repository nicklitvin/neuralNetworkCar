class NeuronLevel {
    inputNodes : number[];
    outputNodes : number[];
    outputBiases : number[];
    weights : number[][] = [];

    constructor(inputNum : number, outputNum : number) {
        this.inputNodes = new Array(inputNum);
        this.outputNodes = new Array(outputNum);
        this.outputBiases = new Array(outputNum);

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
            level.outputBiases[j] = Math.random()*2 - 1;
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
            if (sum >= level.outputBiases[j]) {
                level.outputNodes[j] = 1;
            } 
        }
        return level.outputNodes;
    }
}