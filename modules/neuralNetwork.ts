class NeuralNetwork {
    public levels : NeuronLevel[] = [];
    private static maxMutationConstant = 5;

    constructor(neuronCounts : number[]) {
        // TODO: assert reasonable counts
        for (let i = 0; i < neuronCounts.length - 1; i++) {
            this.levels.push(
                new NeuronLevel(neuronCounts[i],neuronCounts[i+1])
            );
        }
    }

    /**
     * Calculates value of each output node given network configurations. 
     * 
     * @param givenInputs length must match length of network input nodes
     * @param network 
     * @returns outputs as array containing 0s and 1s
     */
    static feedForward(
        givenInputs : number[], network : NeuralNetwork) : number[] 
    {
        let outputs = NeuronLevel.feedForward(givenInputs,network.levels[0]);
        for (let i = 1; i < network.levels.length - 1; i++) {
            outputs = NeuronLevel.feedForward(outputs,network.levels[i]);
        }
        return outputs; 
    }

    /**
     * Mutate network's output thresholds and weights constrained by constant.
     * 
     * @param network 
     * @param constant 
     */
    static mutate(network : NeuralNetwork, constant : number) : void {
        constant = Math.min(constant, this.maxMutationConstant);
        for (let level of network.levels) {
            NeuronLevel.mutateOutputThresh(level, constant);
            NeuronLevel.mutateWeights(level, constant);
        }
    }
}