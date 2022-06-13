class Road {
    private left : number;
    private top : number;
    private width : number;
    private height : number;
    private lanes : number;

    private borders : Border[] = [];

    private borderColor = "white";
    private borderWidth = 5;

    private laneBorderColor = "white";
    private laneBorderWidth = 2;
    private laneBorderDashes = [20,20];

    constructor(xCenter : number, yCenter : number, width : number, height : number, lanes : number) {
        this.left = xCenter - width / 2;
        this.top = yCenter - height / 2;
        this.width = width;
        this.height = height;
        this.lanes = lanes;

        let leftBorder = new Border(
            new Coordinate(this.left, - this.height/2),
            new Coordinate(this.left, this.height/2)
        );
        let rightBorder = new Border(
            new Coordinate(this.left + this.width, - this.height/2),
            new Coordinate(this.left + this.width, this.height/2)
        );
        this.borders.push(leftBorder);
        this.borders.push(rightBorder);
    }

    draw(ctx : CanvasRenderingContext2D) : void {
        ctx.lineWidth = this.laneBorderWidth;
        ctx.strokeStyle = this.laneBorderColor;
        ctx.setLineDash(this.laneBorderDashes);

        for (let i = 1; i < this.lanes; i++) {
            const x = this.left + i * this.width / this.lanes;

            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.top + this.height);
            ctx.stroke();
        }        

        ctx.lineWidth = this.borderWidth;
        ctx.strokeStyle = this.borderColor;

        for (let border of this.borders) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(border.from.x,border.from.y);
            ctx.lineTo(border.to.x,border.to.y);
            ctx.stroke();
        }
    } 
}