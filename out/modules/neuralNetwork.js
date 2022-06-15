class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = [];
        // TODO: assert reasonable counts
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(new NeuronLevel(neuronCounts[i], neuronCounts[i + 1]));
        }
    }
    static feedForward(givenInputs, network) {
        let outputs = NeuronLevel.feedForward(givenInputs, network.levels[0]);
        for (let i = 1; i < network.levels.length - 1; i++) {
            outputs = NeuronLevel.feedForward(outputs, network.levels[i]);
        }
        return outputs;
    }
    static mutate(network, constant) {
        for (let level of network.levels) {
            NeuronLevel.mutateOutputThresh(level, constant);
            NeuronLevel.mutateWeights(level, constant);
        }
    }
}
