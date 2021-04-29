export const negMod = (m, n) => {
    m |= 0;
    n |= 0;
    return ((m % n) + n) % n;
};
export const clamp = (x, min, max) => {
    return Math.max(min, Math.min(x, max));
};
