import { throws } from "assert";
import { JIF } from "../src/jif";
import { loadWithDefaults } from "../src/jif_loader";

describe('filling in defaults', () => {
  it('works for a single empty throw', () => {
    const input: JIF = { throws: [{}] };

    const output = loadWithDefaults(input);

    expect(output).toEqual({
      jugglers: [{ label: 'A', position: jasmine.anything() }],
      limbs: [
        { juggler: 0, label: 'R', kind: 'right_hand' },
        { juggler: 0, label: 'L', kind: 'left_hand' },
      ],
      throws: [
        { time: 0, duration: 3, from: 0, to: 1, object: jasmine.anything() }
      ],
      objects: jasmine.anything(),
    });
  });

  it('works for 3-count passing', () => {
    const input: JIF = {
      jugglers: [{}, {}],
      // Assuming limb ordering: [A:R, B:R, A:L, B:L].
      throws: [
        // A
        { time: 0, from: 0, to: 3 },
        { time: 1, from: 2, to: 0 },
        { time: 2, from: 0, to: 2 },
        // B
        { time: 0, from: 1, to: 2 },
        { time: 1, from: 3, to: 1 },
        { time: 2, from: 1, to: 3 },
      ],
    };

    const output = loadWithDefaults(input);

    expect(output).toEqual({
      jugglers: [
        { label: 'A', position: jasmine.anything() },
        { label: 'B', position: jasmine.anything() }
      ],
      limbs: [
        { juggler: 0, label: 'R', kind: 'right_hand' },
        { juggler: 1, label: 'R', kind: 'right_hand' },
        { juggler: 0, label: 'L', kind: 'left_hand' },
        { juggler: 1, label: 'L', kind: 'left_hand' }
      ],
      throws: [
        { time: 0, duration: 3, from: 0, to: 3, object: jasmine.anything() },
        { time: 1, duration: 3, from: 2, to: 0, object: jasmine.anything() },
        { time: 2, duration: 3, from: 0, to: 2, object: jasmine.anything() },
        { time: 0, duration: 3, from: 1, to: 2, object: jasmine.anything() },
        { time: 1, duration: 3, from: 3, to: 1, object: jasmine.anything() },
        { time: 2, duration: 3, from: 1, to: 3, object: jasmine.anything() }],
      objects: []
    });
  });
});
