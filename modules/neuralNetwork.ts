class NeuralNetwork {
    public levels : NeuronLevel[] = [];

    constructor(neuronCounts : number[]) {
        // TODO: assert reasonable counts
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(
                new NeuronLevel(neuronCounts[i],neuronCounts[i+1])
            );
        }
    }

    static feedForward(givenInputs : number[], network : NeuralNetwork) : number[] {
        let outputs = NeuronLevel.feedForward(givenInputs,network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs = NeuronLevel.feedForward(outputs,network.levels[i]);
        }
        return outputs; 
    }
}