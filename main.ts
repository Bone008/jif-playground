import { JIF } from "./jif";
import { loadWithDefaults } from "./jif-loader";

const TEST_INPUT: JIF = {
  jugglers: [{}, {}],
  throws: [
    { duration: 10 },
    { duration: 6 },
    { duration: 6 },
    { duration: 6 },
    { duration: 7 },
  ]
};

function main() {
  const data = loadWithDefaults(TEST_INPUT);
  console.log(JSON.stringify(data, null, 2));
  console.log();
  console.log('Throws with labels:');
  for (const thrw of data.throws) {
    const fromLimb = data.limbs[thrw.from];
    const fromStr = data.jugglers[fromLimb.juggler].label + ':' + fromLimb.label;
    const toLimb = data.limbs[thrw.to];
    const toStr = data.jugglers[toLimb.juggler].label + ':' + toLimb.label;
    console.log(`- t=${thrw.time}: ${thrw.duration} from ${fromStr} to ${toStr}`);
  }
}
main();
