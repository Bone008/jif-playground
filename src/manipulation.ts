import _ from "lodash";
import { JIF, Throw } from "./jif";
import { FullJIF, inferPeriod, loadWithDefaults } from "./jif_loader";

export interface ManipulatorInstruction {
  type: 'substitute' | 'intercept1b' | 'intercept2b';
  throwTime: number;
  throwFromJuggler: number;
}

export function addManipulator(inputJif: FullJIF, spec: ManipulatorInstruction[]): FullJIF {
  // Drop the recursive completeness constraint.
  const jif: Required<JIF> = _.cloneDeep(inputJif);
  // Add a juggler with 1 limb.
  let manipIndex = jif.jugglers.length;
  let manipLimb = jif.limbs.length;
  let manipAltLimb = manipLimb + 1;
  jif.jugglers.push({ label: 'M', becomes: manipIndex });
  jif.limbs.push({ kind: 'right_hand', juggler: manipIndex });
  jif.limbs.push({ kind: 'left_hand', juggler: manipIndex });

  const sortedSpec = _.sortBy(spec, instruction => instruction.throwTime);
  let lastManipTime = -1;
  for (const [specIndex, { type, throwTime, throwFromJuggler }] of sortedSpec.entries()) {
    // TODO error handling: validate that throwTime does not overlap with previous manipulation
    fillManipulatorThrows(jif, [lastManipTime + 1, throwTime], manipLimb);

    const thrw = jif.throws.find(t => t.time === throwTime && jif.limbs[t.from!].juggler === throwFromJuggler);
    if (!thrw) {
      throw new Error(`Could not find throw for manipulation at time ${throwTime} from juggler ${throwFromJuggler}!`);
    }
    if (type === 'substitute') {
      // Change destination to M, and insert a new throw from M to the original destination.
      const manipThrow: Throw = { time: throwTime, duration: thrw.duration, from: manipLimb, to: thrw.to };
      jif.throws.push(manipThrow);
      thrw.to = manipLimb;
      thrw.duration = 1;

      lastManipTime = throwTime;
    }
    else {
      const isLateCarry = (type === 'intercept2b');
      const interceptedJuggler = jif.limbs[thrw.to!].juggler!;
      // The first beat when interceptedJuggler no longer makes their normal throw because the
      // causal line is missing. The throw at this beat is the "pause" (2-beat) or "carry" (1-beat).
      // TODO Handle edge case when this wraps around the period.
      const causalThreshold = throwTime + thrw.duration! - 2;

      // Adjust all future throws. Iterate over copy to ignore in-loop modifications.
      for (const nextThrow of jif.throws.slice()) {
        const fromJuggler = jif.limbs[nextThrow.from!].juggler;
        const toJuggler = jif.limbs[nextThrow.to!].juggler;
        const causalTime = nextThrow.time! + nextThrow.duration! - 2;
        // All throws landing at or after the causal cutoff are thrown TO the old manipulator.
        if (toJuggler === interceptedJuggler && causalTime >= causalThreshold) {
          // Sanity check.
          if (causalTime === causalThreshold && nextThrow !== thrw) {
            throw new Error('Assertion violated: different throw landing at the same time as intercepted throw!');
          }
          const limbKind = jif.limbs[nextThrow.to!].kind!;
          nextThrow.to = (limbKind === 'right_hand' ? manipLimb : manipAltLimb);
        }

        if (fromJuggler === interceptedJuggler) {
          const deltaToThreshold = nextThrow.time! - causalThreshold;
          const limbKind = jif.limbs[nextThrow.from!].kind!;

          // Early carry: All throws starting after the threshold are thrown BY the old manipulator.
          // Late carry: The first throw after the threshold is still thrown (carried) BY juggler.
          if (deltaToThreshold > 1 || (!isLateCarry && deltaToThreshold === 1)) {
            nextThrow.from = (limbKind === 'right_hand' ? manipLimb : manipAltLimb);
          }
          // This is the crucial throw! Early carry: This is the carry and can stay as-is.
          // Late carry: This throw is delayed a beat and thrown by the old manipulator instead.
          else if (isLateCarry && deltaToThreshold === 0) {
            console.log(`DEBUG: found throw to delay:`, nextThrow);
            // Insert a 2 here instead, which is the 1 from new manipulator's (t+1) thrown earlier.
            jif.throws.push({
              time: nextThrow.time, duration: 2,
              from: nextThrow.from, to: nextThrow.from,
            });
            nextThrow.time!++;
            nextThrow.duration!--;
            nextThrow.from = (limbKind === 'right_hand' ? manipAltLimb : manipLimb);
            // TODO Check if limb handedness is correct.
          }
        }
      }

      // Fill in time where M still waits for their intercept to arrive.
      fillManipulatorThrows(jif, [throwTime, causalThreshold + 1], manipLimb);

      // Swap relabeling.
      const manipBecomes = jif.jugglers[manipIndex].becomes;
      jif.jugglers[manipIndex].becomes = jif.jugglers[interceptedJuggler].becomes;
      jif.jugglers[interceptedJuggler].becomes = manipBecomes;
      // Swap who we think about as M.
      for (const nextInstruction of spec.slice(specIndex + 1)) {
        if (nextInstruction.throwFromJuggler === interceptedJuggler) {
          nextInstruction.throwFromJuggler = manipIndex;
        }
      }
      manipLimb = jif.limbs.findIndex(limb => limb.juggler === interceptedJuggler && limb.kind === 'right_hand');
      manipAltLimb = jif.limbs.findIndex(limb => limb.juggler === interceptedJuggler && limb.kind === 'left_hand');
      manipIndex = interceptedJuggler;

      if (isLateCarry) {
        // Carry happened 1 beat after the threshold.
        lastManipTime = causalThreshold + 1;
      }
      else {
        // Carry happened on the same beat as the threshold.
        lastManipTime = causalThreshold;
      }
    }
  }

  const period = inferPeriod(inputJif);
  fillManipulatorThrows(jif, [lastManipTime + 1, period], manipLimb);

  return loadWithDefaults(jif);
}

/** Generates manipulator throws (1s) in the given half-open time interval [from, to). */
function fillManipulatorThrows(jif: JIF, timeInterval: [number, number], limb: number) {
  for (let time = timeInterval[0]; time < timeInterval[1]; time++) {
    jif.throws!.push({ time, duration: 1, from: limb, to: limb });
  }
}
