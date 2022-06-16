/**
 * Contains function to calculate values regarding the intersection of
 * two lines.
 */
class Intersect {
    constructor() { }
    /**
     * Calculates percent of ray that exists before crossing the wall.
     * Credit for formula: Radu Mariescu-Istodor
     *
     * @param ray
     * @param wall
     * @returns -1 if no interesection exists
     */
    static getPercentUntilWall(ray, wall) {
        const A = ray.from;
        const B = ray.to;
        const C = wall.from;
        const D = wall.to;
        const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
        const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
        const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
        if (bottom != 0) {
            const t = tTop / bottom;
            const u = uTop / bottom;
            if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                return t;
            }
        }
        return -1;
    }
}
