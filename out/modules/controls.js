class Controls {
    constructor(isDummy) {
        this.left = false;
        this.right = false;
        this.forward = false;
        this.reverse = false;
        if (isDummy) {
            this.forward = true;
        }
        else {
            this.addKeyboardListeners();
        }
    }
    addKeyboardListeners() {
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
        };
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
        };
    }
}
