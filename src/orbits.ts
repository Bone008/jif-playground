import { PrechacNotation, prechacToJif } from "./high-level-converter";
import { JIF } from "./jif";
import { FullJIF, FullThrow, loadWithDefaults } from "./jif-loader";

const JIF_3_COUNT_PASSING: JIF = {
  jugglers: [{}, {}],
  // Limbs: [A:R, B:R, A:L, B:L]
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

const INPUT_3_COUNT_PASSING: JIF = prechacToJif([
  '3B 3  3',
  '3A 3  3',
]);
const INPUT_3_COUNT_PASSING_2X: JIF = prechacToJif([
  '3B 3  3  3B 3  3',
  '3A 3  3  3A 3  3',
]);

// TODO install lodash and assert that both are equal

const INPUT_4_COUNT_PASSING: JIF = prechacToJif([
  '3B 3  3  3',
  '3A 3  3  3',
]);
const INPUT_4_COUNT_PASSING_2X: JIF = prechacToJif([
  '3B 3  3  3  3B 3  3  3',
  '3A 3  3  3  3A 3  3  3',
]);

const data = loadWithDefaults(INPUT_4_COUNT_PASSING_2X);

function main() {
  console.log(data);
  console.log();
  console.log('Throws with labels:');
  for (const thrw of data.throws) {
    const fromLimb = data.limbs[thrw.from];
    const fromStr = data.jugglers[fromLimb.juggler].label + ':' + fromLimb.label;
    const toLimb = data.limbs[thrw.to];
    const toStr = data.jugglers[toLimb.juggler].label + ':' + toLimb.label;
    console.log(`- t=${thrw.time}: ${thrw.duration} from ${fromStr} to ${toStr}`);
  }

  // Assumptions: integer throws, only 1 throw per juggler per beat
  const period = Math.max(...data.throws.map(t => t.time)) + 1;
  // Indexed by [juggler][time].
  const throwTable: FullThrow[][] = Array.from({ length: data.jugglers.length }, () => Array(period));
  for (const thrw of data.throws) {
    const juggler = data.limbs[thrw.from].juggler;
    throwTable[juggler][thrw.time] = thrw;
  }

  console.log();
  console.log('Table:');
  console.log('t', '|', Array.from({ length: period }, (_, i) => i).join('  '));
  console.log('-'.repeat(1 + 3 * period));
  for (let j = 0; j < data.jugglers.length; j++) {
    console.log(
      data.jugglers[j].label,
      '|',
      throwTable[j].map(t => {
        const isPass = data.limbs[t.to].juggler !== data.limbs[t.from].juggler;
        return String(t.duration) + (isPass ? 'p' : ' ');
      }).join(' '));
  }

  console.log();
  console.log('Orbits:');

  type Orbit = FullThrow[];
  const allOrbits: Orbit[] = [];
  // Indexed by [juggler][time].
  const orbitsByBeat: Array<Orbit | undefined>[] = Array.from({ length: data.jugglers.length }, () => Array(period));
  let startJ = 0;
  let startT = 0;
  while (startJ < data.jugglers.length) {
    // Find first throw in table that is not part of an orbit yet.
    if (orbitsByBeat[startJ][startT]) {
      startT++;
      if (startT >= period) {
        startT = 0;
        startJ++;
      }
      continue;
    }

    console.log(`(Starting an orbit at juggler ${startJ}, beat ${startT}.)`);
    completeOrbit(startJ, startT);
    allOrbits.push(orbitsByBeat[startJ][startT]!);
  }

  console.log();
  for (const orbit of allOrbits) {
    console.log(orbit
      .map(thrw => data.jugglers[data.limbs[thrw.from].juggler].label + String(thrw.time))
      .join(' --> '));
  }

  function completeOrbit(j: number, t: number, orbit: Orbit = []) {
    const existingOrbit = orbitsByBeat[j][t];
    if (existingOrbit) {
      if (existingOrbit !== orbit) {
        throw new Error('Assertion violated: arrived at an orbit that is not the current one.');
      }
      console.log(`(Found orbit with length ${orbit.length}.)`);
      return; // Found a cycle.
    }

    const thrw = throwTable[j][t];
    // Note down throw in orbit.
    orbit.push(thrw);
    orbitsByBeat[j][t] = orbit;

    // Find out where to continue orbit.
    let nextJ = data.limbs[thrw.to].juggler;
    let nextT = t + thrw.duration;
    while (nextT >= period) {
      nextT -= period;
      nextJ = (nextJ + 1) % data.jugglers.length; // Assumption: relabeling is A->B->C->...->A
    }
    completeOrbit(nextJ, nextT, orbit);
  }
}

main();
