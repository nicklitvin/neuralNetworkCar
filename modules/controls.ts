class Controls {
    public left : boolean = false;
    public right : boolean = false;
    public forward : boolean = false;
    public reverse : boolean = false;

    constructor(isDummy : boolean) {
        if (isDummy) {
            this.forward = true;
        } else {
            this.addKeyboardListeners();
        }
    }

    private addKeyboardListeners() : void{
        document.onkeydown = (event) => {
            switch (event.key) {
                case "w":
                    this.forward = true; 
                    break;
                case "a":
                    this.left = true;
                    break;
                case "s":
                    this.reverse = true;
                    break;
                case "d":
                    this.right = true;
                    break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case "w":
                    this.forward = false; 
                    break;
                case "a":
                    this.left = false;
                    break;
                case "s":
                    this.reverse = false;
                    break;
                case "d":
                    this.right = false;
                    break;
            }
        }
    }
}