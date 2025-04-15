import { DAY } from "@/entities/date";

export const getDiscountRateByDayOfWeek = () => {
  const day = new Date().getDay();

  const discountRateMap = {
    [DAY.monday]: 0,
    [DAY.tuesday]: 0.1,
    [DAY.wednesday]: 0,
    [DAY.thursday]: 0,
    [DAY.friday]: 0,
    [DAY.saturday]: 0,
    [DAY.sunday]: 0,
  };

  return discountRateMap[day];
};
