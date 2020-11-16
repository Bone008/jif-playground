import { JIF } from "./jif";
import { loadWithDefaults } from "./jif_loader";
import orbits from "./orbits";
import * as testdata from "./test_data";

function main(args: string[]) {
  const verbose = args.length > 0 && args[0] === '-v';

  const input = testdata.DATA_4_COUNT_PASSING;

  const data = loadWithDefaults(input);
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
