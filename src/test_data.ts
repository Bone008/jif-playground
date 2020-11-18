/** @file Exports patterns that are used throughout the code. */

import { prechacToJif } from "./high_level_converter";
import { JIF } from "./jif";

export const DATA_5_COUNT_POPCORN: JIF = {
  jugglers: [{becomes: 1}, {becomes: 0}],
  throws: [
    { duration: 10 },
    { duration: 6 },
    { duration: 6 },
    { duration: 6 },
    { duration: 7 },
  ]
};

export const DATA_HOLY_GRAIL: JIF = {
  jugglers: [{becomes: 1}, {becomes: 0}],
  throws: [
    { duration: 9 },
    { duration: 7 },
    { duration: 5 },
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
export const DATA_WEIRD_PASSING: JIF = prechacToJif([
  // Made to test intercept of B at beat 4.
  '4 4 4 4 4 4 4 4 4 4 4 4 4 4',
  '4 4 4 4 4 4 4 5 3 4 4 4 4 4',
]);

export const DATA_WALKING_FEED_9C: JIF = prechacToJif([
  '3B 3  3C 3  3B 3 ',
  '3A 3  3  3  3A 3 ',
  '3  3  3A 3  3  3 ',
]);
export const DATA_WALKING_FEED_9C_2X: JIF = prechacToJif([
  '3B 3  3C 3  3B 3  3C 3  3  3  3C 3',
  '3A 3  3  3  3A 3  3  3  3C 3  3  3',
  '3  3  3A 3  3  3  3A 3  3B 3  3A 3',
]);

export const DATA_WALKING_FEED_10C: JIF = prechacToJif([
  '4B 3  4C 3  4B 3  4C',
  '3  4A 3  3  3  4A 4 ',
  '2  3  3  4A 3  3  3 ',
]);
