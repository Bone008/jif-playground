import { PrechacNotation, prechacToJif } from "../src/high_level_converter";

describe('prechacToJif', () => {
  it('works for 3-count', () => {
    const input: PrechacNotation = [
      '3B 3  3',
      '3A 3  3',
    ];

    const output = prechacToJif(input);

    expect(output).toEqual({
      jugglers: [{becomes: 1}, {becomes: 0}],
      limbs: [
        {juggler: 0, kind: 'right_hand'},
        {juggler: 0, kind: 'left_hand'},
        {juggler: 1, kind: 'right_hand'},
        {juggler: 1, kind: 'left_hand'},
      ],
      // Assuming limbs: [A:R, B:R, A:L, B:L].
      throws: [
        // A
        { time: 0, duration: 3, from: 0, to: 3 },
        { time: 1, duration: 3, from: 1, to: 0 },
        { time: 2, duration: 3, from: 0, to: 1 },
        // B
        { time: 0, duration: 3, from: 2, to: 1 },
        { time: 1, duration: 3, from: 3, to: 2 },
        { time: 2, duration: 3, from: 2, to: 3 },
      ],
    });
  });
});
