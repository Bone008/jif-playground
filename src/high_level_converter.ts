import { JIF, Throw } from "./jif";

export type PrechacNotation = string[];
/**
 * Converts prechac notation to JIF. The input should be given as 1 line per juggler, assuming
 * automatic relabeling at the end. Siteswaps >=10 must be written as letters.
 * Passes should be written as a suffix with the letter of the target juggler, e.g. "3B".
 */
export function prechacToJif(prechac: PrechacNotation): JIF {
  const jifThrows: Throw[] = [];

  const numJugglers = prechac.length;
  let period: number | null = null;
  for (const [j, line] of prechac.entries()) {
    const elements = line.trim().split(/\s+/);

    if (period && elements.length !== period) {
      throw new Error('instructions must be the same length!');
    }
    period = elements.length;
    for (const [time, str] of elements.entries()) {
      const { duration, passTarget } = parseInstruction(str);
      const targetJuggler = passTarget === null ? j : passTarget;
      jifThrows.push({
        time,
        duration,
        // Even time: right hand; odd time: left hand.
        from: limbOfJuggler(j, time % 2, numJugglers),
        to: limbOfJuggler(targetJuggler, (time + duration) % 2, numJugglers),
      });
    }
  }
  return {
    jugglers: Array.from({ length: prechac.length },
      (_, j) => ({ becomes: (j + 1) % prechac.length })),
    limbs: Array.from({ length: prechac.length * 2 }, (_, l) => ({
      juggler: Math.floor(l / 2),
      kind: l % 2 === 0 ? 'right_hand' : 'left_hand',
    })),
    throws: jifThrows,
  };
}

interface PrechacInstruction {
  duration: number;
  passTarget: number | null;
}
// Example: 3B ^= single pass to B
const REGEX_INSTRUCTION = /^([0-9a-z])([a-z])?$/i;

function parseInstruction(str: string): PrechacInstruction {
  const match = REGEX_INSTRUCTION.exec(str);
  if (!match) {
    throw new Error('throw must match (single-letter throw)(pass target)?(!manipulation)?');
  }

  const duration = parseInt(match[1], 36);
  if (!isFinite(duration)) {
    throw new Error('invalid duration for throw: ' + str);
  }
  const passTarget = match[2] ? match[2].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) : null;
  return { duration, passTarget };
}

// May need to change if default limb order changes.
function limbOfJuggler(jugglerIndex: number, limbIndex: number, numJugglers: number): number {
  return 2 * jugglerIndex + limbIndex;
}
