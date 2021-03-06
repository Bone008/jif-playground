import { FullJIF, FullThrow, loadWithDefaults } from "./jif_loader";
import { addManipulator, formatManipulator, ManipulatorInstruction } from "./manipulation";
import orbits from "./orbits";
import * as testdata from "./test_data";

function main(args: string[]) {
  const verbose = args.includes('-v');
  const withManipulation = args.includes('-m');
  const iterateAll = args.includes('-A');

  if (iterateAll) {
    doIterateAll();
    return;
  }

  const input = testdata.DATA_WALKING_FEED_10C;
  let data = loadWithDefaults(input);

  let manipulator: ManipulatorInstruction[] | null = null;
  if (withManipulation) {
    // 3-count roundabout
    // manipulator = [
    //   { type: 'substitute', throwTime: 0, throwFromJuggler: 0 },
    //   { type: 'intercept1b', throwTime: 2, throwFromJuggler: 1 },
    // ];

    // 4-count roundabout
    // manipulator = [
    //   { type: 'substitute', throwTime: 0, throwFromJuggler: 0 },
    //   { type: 'substitute', throwTime: 2, throwFromJuggler: 1 },
    //   { type: 'intercept2b', throwTime: 4, throwFromJuggler: 0 },
    // ];

    // Scrambled B
    // manipulator = [
    //   { type: 'intercept2b', throwTime: 0, throwFromJuggler: 0 },
    //   { type: 'substitute', throwTime: 4, throwFromJuggler: 1 },
    // ];

    // // V
    // const m: ManipulatorInstruction[] = [
    //   { type: 'substitute', throwTime: 2, throwFromJuggler: 1 },
    //   { type: 'intercept2b', throwTime: 4, throwFromJuggler: 2 },
    // ];
    // console.log('Using manipulation:', formatManipulator(data, m, true));
    // manipulator = m);

    // // Ivy
    // manipulator = [
    //   { type: 'intercept2b', throwTime: 0, throwFromJuggler: 1 },
    //   { type: 'substitute', throwTime: 4, throwFromJuggler: 2 },
    // ];

    // Choptopus
    manipulator = [
      { type: 'substitute', throwTime: 1, throwFromJuggler: 1 },
      { type: 'intercept2b', throwTime: 3, throwFromJuggler: 2 },
    ];

    console.log('Using manipulation:\n    ' + formatManipulator(data, manipulator));
    console.log();
    data = addManipulator(data, manipulator);
  }
  else {
    console.log('#######################################################');
    console.log('NOT adding any manipulation. Use the -m flag to change.');
    console.log('#######################################################\n');
  }

  if (verbose) {
    console.log('## INPUT ##');
    console.log(input);
    console.log();
    console.log('## WITH DEFAULTS ##');
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
    console.log();
  }

  orbits(data, verbose);
}

function doIterateAll() {
  const data = loadWithDefaults(testdata.DATA_WALKING_FEED_9C);

  const goodResults: [ManipulatorInstruction[], FullJIF, FullThrow[]][] = [];
  for (const interceptTime of [0, 2, 4]) {
    for (const interceptPerson of [0, 1, 2]) {
      for (const substitutePerson of [0, 1, 2]) {
        const spec: ManipulatorInstruction[] = [
          { type: 'intercept2b', throwTime: interceptTime, throwFromJuggler: interceptPerson },
          { type: 'substitute', throwTime: (interceptTime + 4) % 6, throwFromJuggler: substitutePerson },
        ];
        const manipData = addManipulator(data, spec);
        const os = orbits(manipData, false);
        for (const orbit of os) {
          if (orbit.every(thrw => thrw.duration < 3 || thrw.isManipulated)) {
            goodResults.push([spec, manipData, orbit]);
          }
        }
      }
    }
  }
  console.log(`\n\n${goodResults.length} results:`);
  for (const [spec, jif, orbit] of goodResults) {
    console.log(
      formatManipulator(data, spec, true),
      '|',
      orbit
        .map(thrw => `${jif.jugglers[jif.limbs[thrw.from].juggler].label}${thrw.time}(${thrw.duration.toString(36)})`)
        .join(' --> '));
  }
}

main(process.argv.slice(2));
