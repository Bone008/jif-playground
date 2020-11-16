import { PrechacNotation, prechacToJif } from "../src/high_level_converter";

describe('prechacToJif', () => {
  it('works for 3-count', () => {
    const input: PrechacNotation = [
      '3B 3  3',
      '3A 3  3',
    ];

    const output = prechacToJif(input);

    expect(output).toEqual({
      jugglers: [{}, {}],
      // Assuming limbs: [A:R, B:R, A:L, B:L].
      throws: [
        // A
        { time: 0, duration: 3, from: 0, to: 3 },
        { time: 1, duration: 3, from: 2, to: 0 },
        { time: 2, duration: 3, from: 0, to: 2 },
        // B
        { time: 0, duration: 3, from: 1, to: 2 },
        { time: 1, duration: 3, from: 3, to: 1 },
        { time: 2, duration: 3, from: 1, to: 3 },
      ],
    });
  });
});
