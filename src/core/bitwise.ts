/**
 * 判断是否支持着写flags
 */
export const contains = (bit: number, value: number): boolean => (bit & value) !== 0;
