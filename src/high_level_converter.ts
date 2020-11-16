import { JIF, Throw } from "./jif";
import { emptyObjects } from "./jif_loader";

// Example: "3b 3 3"
export type PrechacNotation = string[];
export function prechacToJif(prechac: PrechacNotation): JIF {
  const jifThrows: Throw[] = [];

  const numJugglers = prechac.length;
  let period: number | null = null;
  for (const [j, line] of prechac.entries()) {
    const elements = line.split(/\s+/);

    if (period && elements.length !== period) {
      throw new Error('instructions must be the same length!');
    }
    period = elements.length;
    for (const [time, str] of elements.entries()) {
      if (str.length > 2) {
        throw new Error('throws must match (single-letter throw)(pass)?');
      }
      const duration = parseInt(str[0], 36);
      if (!isFinite(duration)) {
        throw new Error('invalid duration for throw: ' + str);
      }

      const targetJuggler = str.length > 1 ? str[1].toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) : j;
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
    jugglers: emptyObjects(prechac.length),
    throws: jifThrows,
  };
}

// May need to change if default limb order changes.
function limbOfJuggler(jugglerIndex: number, limbIndex: number, numJugglers: number): number {
  return jugglerIndex + numJugglers * limbIndex;
}
