var Controls = /** @class */ (function () {
    function Controls() {
        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;
        this.addKeyboardListeners();
    }
    Controls.prototype.addKeyboardListeners = function () {
        var _this = this;
        document.onkeydown = function (event) {
            switch (event.key) {
                case "w":
                    _this.up = true;
                    break;
                case "a":
                    _this.left = true;
                    break;
                case "s":
                    _this.down = true;
                    break;
                case "d":
                    _this.right = true;
                    break;
            }
        };
        document.onkeyup = function (event) {
            switch (event.key) {
                case "w":
                    _this.up = false;
                    break;
                case "a":
                    _this.left = false;
                    break;
                case "s":
                    _this.down = false;
                    break;
                case "d":
                    _this.right = false;
                    break;
            }
        };
    };
    return Controls;
}());
