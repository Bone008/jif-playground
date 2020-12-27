/** @file Defines raw input format for JIF.  */

export interface JIF {
  jugglers?: Juggler[];
  limbs?: Limb[];
  objects?: JifObject[];
  throws?: Throw[];
}

export interface Juggler {
  label?: string;
  becomes?: number;
  position?: [number, number];
}

export type LimbKind = 'right_hand'|'left_hand'|'other';
export interface Limb {
  juggler?: number;
  label?: string;
  kind?: LimbKind;
}

export interface JifObject {
  type?: 'ball'|'club'|'ring';
  color?: string;
}

export interface Throw {
  time?: number;
  duration?: number;
  from?: number;
  to?: number;
}
