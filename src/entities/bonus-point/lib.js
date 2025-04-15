import { BONUS_POINT_RATE } from "./constants";

export const calcBonusPoints = (totalAmount) =>
  Math.floor(totalAmount * BONUS_POINT_RATE);
