import { JifObject, Juggler, Limb, JIF, Throw, LimbKind } from "./jif";

const LIMB_NAMES_BY_KIND: Record<LimbKind, string> = {
  right_hand: 'R',
  left_hand: 'L',
  other: 'O',
};

type RequiredRecursive<T> = {
  [P in keyof T]-?:
  T[P] extends (infer U)[] ? RequiredRecursive<U>[] :
  T[P] extends (object | undefined) ? RequiredRecursive<T[P]> :
  T[P];
};

export type FullJIF = RequiredRecursive<JIF>;
export type FullJuggler = RequiredRecursive<Juggler>;
export type FullLimb = RequiredRecursive<Limb>;
export type FullThrow = RequiredRecursive<Throw>;
export type FullObject = RequiredRecursive<JifObject>;

export function loadWithDefaults(jif: JIF): FullJIF {
  const rawJugglers = jif.jugglers || [{}];
  const jugglers = rawJugglers.map<FullJuggler>((juggler, j) => ({
    label: def(juggler.label, indexToJugglerName(j)),
    becomes: def(juggler.becomes, j),
    position: def(juggler.position, [0, 0]),
  }));

  const rawLimbs = jif.limbs || emptyObjects(jugglers.length * 2);
  const limbs = rawLimbs.map<FullLimb>((limb, i) => {
    const kind: LimbKind = def(limb.kind,
      i < jugglers.length ? 'right_hand' : i < jugglers.length * 2 ? 'left_hand' : 'other');
    return {
      juggler: def(limb.juggler, i % jugglers.length),
      kind,
      label: def(limb.label, LIMB_NAMES_BY_KIND[kind]),
    };
  });

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

export function inferPeriod(jif: JIF): number {
  return jif.throws ? Math.max(...jif.throws.map((t, i) => def(t.time, i))) + 1 : 0;
}

// Util

export function emptyObjects<T extends {}>(num: number): Array<Partial<T>> {
  const result = Array<Partial<T>>(num);
  for (let i = 0; i < num; i++) {
    result[i] = {};
  }
  return result;
}

export function indexToJugglerName(index: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + index);
}

/** Returns a value, unless it is undefined, then it returns defaultValue. */
function def<T>(value: T | undefined, defaultValue: T): T {
  return value !== undefined ? value : defaultValue;
}
