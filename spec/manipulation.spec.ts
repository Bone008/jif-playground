import _ from "lodash";
import { PrechacNotation, prechacToJif } from "../src/high_level_converter";
import { JIF } from "../src/jif";
import { loadWithDefaults } from "../src/jif_loader";
import { addManipulator, ManipulatorInstruction, shiftPatternBy } from "../src/manipulation";

const PRECHAC_WALKING_FEED_9C: PrechacNotation = [
  '3B 3  3C 3  3B 3 ',
  '3A 3  3  3  3A 3 ',
  '3  3  3A 3  3  3 ',
];
const DATA_WALKING_FEED_9C: JIF = prechacToJif(PRECHAC_WALKING_FEED_9C);

describe('addManipulator', () => {
  it('works for an empty manipulator', () => {
    const input = loadWithDefaults(DATA_WALKING_FEED_9C);
    const withManipulator = loadWithDefaults(prechacToJif(
      PRECHAC_WALKING_FEED_9C.concat(['1 1 1 1 1 1'])));

    const output = addManipulator(input, []);

    expect(output.jugglers[3]).toEqual(jasmine.objectContaining({ label: 'M', becomes: 3 }));
    expect(_.sortBy(output.throws, 'time')).toEqual(_.sortBy(withManipulator.throws, 'time'));
  });

  it('works for Scrambled V', () => {
    const input = loadWithDefaults(DATA_WALKING_FEED_9C);
    const spec: ManipulatorInstruction[] = [
      { type: 'substitute', throwTime: 2, throwFromJuggler: 1 },
      { type: 'intercept2b', throwTime: 4, throwFromJuggler: 2 },
    ];

    const output = addManipulator(input, spec);

    // Equivalent to this table representation:
    // t | 0  1  2  3  4  5
    // ---------------------
    // A | 2  3  3C 3  3B 3  -> B
    // B | 3A 3  1M 3  3A 3  -> C
    // C | 3  3  3A 3  3M 2  -> M
    // M | 3B 1  3B 1  1  1  -> A
    expect(output).toEqual(jasmine.objectContaining({
      jugglers: [
        jasmine.objectContaining({ label: 'A', becomes: 1 }),
        jasmine.objectContaining({ label: 'B', becomes: 2 }),
        jasmine.objectContaining({ label: 'C', becomes: 3 }),
        jasmine.objectContaining({ label: 'M', becomes: 0 }),
      ],
      limbs: [
        { juggler: 0, kind: 'right_hand', label: 'R' },
        { juggler: 0, kind: 'left_hand', label: 'L' },
        { juggler: 1, kind: 'right_hand', label: 'R' },
        { juggler: 1, kind: 'left_hand', label: 'L' },
        { juggler: 2, kind: 'right_hand', label: 'R' },
        { juggler: 2, kind: 'left_hand', label: 'L' },
        { juggler: 3, kind: 'right_hand', label: 'R' },
        { juggler: 3, kind: 'left_hand', label: 'L' },
      ],
      throws: [
        { time: 0, duration: 3, from: 6, to: 3, object: -1 },
        { time: 1, duration: 3, from: 1, to: 0, object: -1 },
        { time: 2, duration: 3, from: 0, to: 5, object: -1 },
        { time: 3, duration: 3, from: 1, to: 0, object: -1 },
        { time: 4, duration: 3, from: 0, to: 3, object: -1 },
        { time: 5, duration: 3, from: 1, to: 0, object: -1 },
        { time: 0, duration: 3, from: 2, to: 1, object: -1 },
        { time: 1, duration: 3, from: 3, to: 2, object: -1 },
        { time: 2, duration: 1, from: 2, to: 7, object: -1 },
        { time: 3, duration: 3, from: 3, to: 2, object: -1 },
        { time: 4, duration: 3, from: 2, to: 1, object: -1 },
        { time: 5, duration: 3, from: 3, to: 2, object: -1 },
        { time: 0, duration: 3, from: 4, to: 5, object: -1 },
        { time: 1, duration: 3, from: 5, to: 4, object: -1 },
        { time: 2, duration: 3, from: 4, to: 1, object: -1 },
        { time: 3, duration: 3, from: 5, to: 4, object: -1 },
        { time: 4, duration: 3, from: 4, to: 7, object: -1 },
        { time: 0, duration: 2, from: 0, to: 0, object: -1 },
        { time: 5, duration: 2, from: 5, to: 5, object: -1 },
        { time: 4, duration: 1, from: 6, to: 7, object: -1 },
        { time: 5, duration: 1, from: 7, to: 6, object: -1 },
        { time: 1, duration: 1, from: 7, to: 6, object: -1 },
        { time: 2, duration: 3, from: 6, to: 3, object: -1 },
        { time: 3, duration: 1, from: 7, to: 6, object: -1 },
      ],
    }));
  });

  it('works for Unscrambled B', () => {
    const input = loadWithDefaults(DATA_WALKING_FEED_9C);
    const spec: ManipulatorInstruction[] = [
      { type: 'intercept2b', throwTime: 0, throwFromJuggler: 0 },
      { type: 'substitute', throwTime: 4, throwFromJuggler: 1 },
    ];

    const output = addManipulator(input, spec);

    // Equivalent to this table representation:
    // t | 0  1  2  3  4  5
    // ---------------------
    // A | 3M 3  3C 3  3M 3  -> B
    // B | 3A 2  3M 1  3A 1  -> M
    // C | 3  3  3A 3  3  3  -> A
    // M | 1  1  2  3  1B 3  -> C
    expect(output).toEqual(jasmine.objectContaining({
      jugglers: [
        jasmine.objectContaining({ label: 'A', becomes: 1 }),
        jasmine.objectContaining({ label: 'B', becomes: 3 }),
        jasmine.objectContaining({ label: 'C', becomes: 0 }),
        jasmine.objectContaining({ label: 'M', becomes: 2 }),
      ],
      limbs: [
        { juggler: 0, kind: 'right_hand', label: 'R' },
        { juggler: 0, kind: 'left_hand', label: 'L' },
        { juggler: 1, kind: 'right_hand', label: 'R' },
        { juggler: 1, kind: 'left_hand', label: 'L' },
        { juggler: 2, kind: 'right_hand', label: 'R' },
        { juggler: 2, kind: 'left_hand', label: 'L' },
        { juggler: 3, kind: 'right_hand', label: 'R' },
        { juggler: 3, kind: 'left_hand', label: 'L' },
      ],
      throws: [
        { time: 0, duration: 3, from: 0, to: 7, object: -1 },
        { time: 1, duration: 3, from: 1, to: 0, object: -1 },
        { time: 2, duration: 3, from: 0, to: 5, object: -1 },
        { time: 3, duration: 3, from: 1, to: 0, object: -1 },
        { time: 4, duration: 3, from: 0, to: 7, object: -1 },
        { time: 5, duration: 3, from: 1, to: 0, object: -1 },
        { time: 0, duration: 3, from: 2, to: 1, object: -1 },
        { time: 2, duration: 2, from: 6, to: 6, object: -1 },
        { time: 2, duration: 3, from: 2, to: 7, object: -1 },
        { time: 3, duration: 3, from: 7, to: 6, object: -1 },
        { time: 4, duration: 1, from: 6, to: 3, object: -1 },
        { time: 5, duration: 3, from: 7, to: 6, object: -1 },
        { time: 0, duration: 3, from: 4, to: 5, object: -1 },
        { time: 1, duration: 3, from: 5, to: 4, object: -1 },
        { time: 2, duration: 3, from: 4, to: 1, object: -1 },
        { time: 3, duration: 3, from: 5, to: 4, object: -1 },
        { time: 4, duration: 3, from: 4, to: 5, object: -1 },
        { time: 5, duration: 3, from: 5, to: 4, object: -1 },
        { time: 1, duration: 2, from: 3, to: 3, object: -1 },
        { time: 0, duration: 1, from: 6, to: 7, object: -1 },
        { time: 1, duration: 1, from: 7, to: 6, object: -1 },
        { time: 3, duration: 1, from: 3, to: 2, object: -1 },
        { time: 4, duration: 3, from: 2, to: 1, object: -1 },
        { time: 5, duration: 1, from: 3, to: 2, object: -1 },
      ],
    }));
  });
});


describe('shiftPatternBy', () => {
  it('yields same result after shifting back and forth', () => {
    const pattern = loadWithDefaults(DATA_WALKING_FEED_9C);

    shiftPatternBy(pattern, 3);
    shiftPatternBy(pattern, -3);

    expect(pattern).toEqual(loadWithDefaults(DATA_WALKING_FEED_9C));
  });

  it('works when shifting 2 forward', () => {
    const pattern = loadWithDefaults(DATA_WALKING_FEED_9C);
    const shiftedPattern = loadWithDefaults(prechacToJif([
      '3  3  3B 3  3C 3 ',
      '3C 3  3A 3  3  3 ',
      '3B 3  3  3  3A 3 ',
    ]));

    shiftPatternBy(pattern, 2);

    expect(pattern.throws).toEqual(jasmine.arrayContaining(shiftedPattern.throws));
  });

  it('works when shifting 2 backward', () => {
    const pattern = loadWithDefaults(DATA_WALKING_FEED_9C);
    const shiftedPattern = loadWithDefaults(prechacToJif([
      '3C 3  3B 3  3C 3 ',
      '3  3  3A 3  3  3 ',
      '3A 3  3  3  3A 3 ',
    ]));

    shiftPatternBy(pattern, -2);

    expect(pattern.throws).toEqual(jasmine.arrayContaining(shiftedPattern.throws));
  });
});
