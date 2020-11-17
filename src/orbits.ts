import _ from "lodash";
import { FullJIF, FullThrow, inferPeriod } from "./jif_loader";

export default function orbits(data: FullJIF, verbose: boolean) {
  // Assumptions: integer throws, only 1 throw per juggler per beat
  const period = inferPeriod(data);
  // Indexed by [juggler][time].
  const throwsTable: Array<FullThrow | null>[] = Array.from({ length: data.jugglers.length },
    () => Array(period).fill(null));
  for (const thrw of data.throws) {
    const juggler = data.limbs[thrw.from].juggler;
    if (throwsTable[juggler][thrw.time]) {
      console.warn(`WARNING: More than 1 throw detected by juggler ${data.jugglers[juggler].label
        } at time ${thrw.time}!\n`);
    }
    throwsTable[juggler][thrw.time] = thrw;
  }

  console.log('Table:');
  printThrowsTable(data, throwsTable);
  console.log('\nHands:');
  printThrowsTable(data, throwsTable, true);

  console.log('\nOrbits:');

  type Orbit = FullThrow[];
  const allOrbits: Orbit[] = [];
  // Indexed by [juggler][time].
  const orbitsByBeat: Array<Orbit | undefined>[] = Array.from({ length: data.jugglers.length }, () => Array(period));
  let startJ = 0;
  let startT = 0;
  while (startJ < data.jugglers.length) {
    // Find first throw in table that is not part of an orbit yet.
    if (!throwsTable[startJ][startT] || orbitsByBeat[startJ][startT]) {
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
      .map(thrw => `${data.jugglers[data.limbs[thrw.from].juggler].label}${thrw.time}(${thrw.duration.toString(36)})`)
      .join(' --> '));
  }
  // Alternative layout: A throws table with only this orbit filled in.
  console.log();
  for (const [i, orbit] of allOrbits.entries()) {
    console.log(`Orbit #${i}:`);
    const orbitOnlyTable = throwsTable.map(row => row.map(t => t && orbit.includes(t) ? t : null));
    printThrowsTable(data, orbitOnlyTable);
    console.log();
  }

  function completeOrbit(j: number, t: number, orbit: Orbit = []) {
    const existingOrbit = orbitsByBeat[j][t];
    if (existingOrbit) {
      if (existingOrbit !== orbit) {
        console.error('debug error info:\ncurrent', orbit, '\nexisting:', existingOrbit);
        throw new Error('Assertion violated: arrived at an orbit that is not the current one.');
      }
      console.log(`(Found orbit with length ${orbit.length}.)`);

      // Found a cycle, shift it so it starts at the minimum time.
      const firstThrow = _.minBy(orbit,
        t => t.time * data.jugglers.length + data.limbs[t.from].juggler)!;
      const startIndex = orbit.indexOf(firstThrow);
      const deleted = orbit.splice(0, startIndex);
      orbit.push(...deleted);
      return;
    }

    const thrw = throwsTable[j][t];
    if (!thrw) {
      throw new Error(`Assertion violated: arrived at juggler ${t} at beat ${t} that has no outgoing throw!`);
    }
    // Note down throw in orbit.
    orbit.push(thrw);
    orbitsByBeat[j][t] = orbit;

    // Find out where to continue orbit.
    let nextJ = data.limbs[thrw.to].juggler;
    let nextT = t + thrw.duration;
    while (nextT >= period) {
      nextT -= period;
      // Follow relabeling.
      nextJ = data.jugglers[nextJ].becomes;
    }
    completeOrbit(nextJ, nextT, orbit);
  }
}

function printThrowsTable(data: FullJIF, throwsTable: Array<FullThrow | null>[], limbsOnly = false) {
  const period = inferPeriod(data);
  console.log('t', '|', Array.from({ length: period }, (_, i) => i).join('  '));
  console.log('-'.repeat(1 + 3 * period));
  for (let j = 0; j < data.jugglers.length; j++) {
    console.log(
      data.jugglers[j].label,
      '|',
      throwsTable[j].map(t => {
        if (!t) { return '_ '; }
        if (limbsOnly) { return data.limbs[t.from].label + ' '; }
        const fromJuggler = data.limbs[t.from].juggler;
        const toJuggler = data.limbs[t.to].juggler;
        const targetStr = fromJuggler === toJuggler ? ' ' : data.jugglers[toJuggler].label;
        return t.duration.toString(36) + targetStr;
      }).join(' '),
      '->',
      data.jugglers[data.jugglers[j].becomes].label);
  }
}
