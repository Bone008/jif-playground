import { JifObject, Juggler, Limb, JIF, Throw } from "./jif";

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

type RequiredRecursive<T> = {
  [P in keyof T]-?:
  T[P] extends (infer U)[] ? RequiredRecursive<U>[] :
  T[P] extends (object | undefined) ? RequiredRecursive<T[P]> :
  T[P];
};

type FullRoot = RequiredRecursive<JIF>;
type FullJuggler = RequiredRecursive<Juggler>;
type FullLimb = RequiredRecursive<Limb>;
type FullThrow = RequiredRecursive<Throw>;
type FullObject = RequiredRecursive<JifObject>;

function fillDefaults(jif: JIF): FullRoot {
  const rawJugglers = jif.jugglers || [{}];
  const jugglers = rawJugglers.map<FullJuggler>((juggler, i) => ({
    label: def(juggler.label, String.fromCharCode('A'.charCodeAt(0) + i)),
    position: def(juggler.position, [0, 0]),
  }));

  const rawLimbs = jif.limbs || emptyObjects(jugglers.length * 2);
  const limbs = rawLimbs.map<FullLimb>((limb, i) => ({
    juggler: def(limb.juggler, i % jugglers.length),
    label: def(limb.label, i < jugglers.length ? 'R' : i < jugglers.length * 2 ? 'L' : 'O'),
    kind: def(limb.kind, i < jugglers.length ? 'right_hand' : i < jugglers.length * 2 ? 'left_hand' : 'other'),
  }));

  const rawThrows = jif.throws || [];
  const throws = rawThrows.map<FullThrow>((thrw, i) => {
    const time = def(thrw.time, i);
    const duration = def(thrw.duration, 3);
    return {
      time,
      duration,
      from: def(thrw.from, time % limbs.length),
      to: def(thrw.to, (time + duration) % limbs.length),
      object: -1,
    };
  });

  const objects: FullObject[] = [/* TODO */];
  return { jugglers, limbs, throws, objects };
}

function main() {
  const data = fillDefaults(TEST_INPUT);
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

// Util

function emptyObjects<T extends {}>(num: number): Array<Partial<T>> {
  const result = Array<Partial<T>>(num);
  for (let i = 0; i < num; i++) {
    result[i] = {};
  }
  return result;
}

/** Returns a value, unless it is undefined, then it returns defaultValue. */
function def<T>(value: T | undefined, defaultValue: T): T {
  return value !== undefined ? value : defaultValue;
}