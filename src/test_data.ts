/** @file Exports patterns that are used throughout the code. */

import { prechacToJif } from "./high_level_converter";
import { JIF } from "./jif";

export const DATA_POPCORN: JIF = {
  jugglers: [{}, {}],
  throws: [
    { duration: 10 },
    { duration: 6 },
    { duration: 6 },
    { duration: 6 },
    { duration: 7 },
  ]
};

export const DATA_3_COUNT_PASSING: JIF = prechacToJif([
  '3B 3  3',
  '3A 3  3',
]);
export const DATA_3_COUNT_PASSING_2X: JIF = prechacToJif([
  '3B 3  3  3B 3  3',
  '3A 3  3  3A 3  3',
]);
export const DATA_4_COUNT_PASSING: JIF = prechacToJif([
  '3B 3  3  3',
  '3A 3  3  3',
]);
export const DATA_4_COUNT_PASSING_2X: JIF = prechacToJif([
  '3B 3  3  3  3B 3  3  3',
  '3A 3  3  3  3A 3  3  3',
]);
