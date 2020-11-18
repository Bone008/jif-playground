import { loadWithDefaults } from "./jif_loader";
import { addManipulator } from "./manipulation";
import orbits from "./orbits";
import * as testdata from "./test_data";

function main(args: string[]) {
  const verbose = args.includes('-v');
  const withManipulation = args.includes('-m');

  const input = testdata.DATA_WALKING_FEED_9C;
  let data = loadWithDefaults(input);

  if (withManipulation) {
    // 3-count roundabout
    // data = addManipulator(data, [
    //   { type: 'substitute', throwTime: 0, throwFromJuggler: 0 },
    //   { type: 'intercept1b', throwTime: 2, throwFromJuggler: 1 },
    // ]);

    // 4-count roundabout
    // data = addManipulator(data, [
    //   { type: 'substitute', throwTime: 0, throwFromJuggler: 0 },
    //   { type: 'substitute', throwTime: 2, throwFromJuggler: 1 },
    //   { type: 'intercept2b', throwTime: 4, throwFromJuggler: 0 },
    // ]);

    // Scrambled B
    // data = addManipulator(data, [
    //   { type: 'intercept2b', throwTime: 0, throwFromJuggler: 0 },
    //   { type: 'substitute', throwTime: 4, throwFromJuggler: 1 },
    // ]);

    // Ivy
    // data = addManipulator(data, [
    //   { type: 'intercept2b', throwTime: 0, throwFromJuggler: 1 },
    //   { type: 'substitute', throwTime: 4, throwFromJuggler: 2 },
    // ]);

    // V
    data = addManipulator(data, [
      { type: 'substitute', throwTime: 2, throwFromJuggler: 1 },
      { type: 'intercept2b', throwTime: 4, throwFromJuggler: 2 },
    ]);
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

main(process.argv.slice(2));
