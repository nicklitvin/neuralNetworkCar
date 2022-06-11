class Controls {
    public left : boolean = false;
    public right : boolean = false;
    public up : boolean = false;
    public down : boolean = false;

    constructor() {
        this.addKeyboardListeners();
    }

    private addKeyboardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "w":
                    this.up = true; 
                    break;
                case "a":
                    this.left = true;
                    break;
                case "s":
                    this.down = true;
                    break;
                case "d":
                    this.right = true;
                    break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case "w":
                    this.up = false; 
                    break;
                case "a":
                    this.left = false;
                    break;
                case "s":
                    this.down = false;
                    break;
                case "d":
                    this.right = false;
                    break;
            }
        }
    }
}