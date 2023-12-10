/* eslint-disable */
import type { SystemStyleObject, ConditionalValue } from '../types/index';
import type { Properties } from '../types/csstype';
import type { PropertyValue } from '../types/prop-type';
import type { DistributiveOmit } from '../types/system-types';
import type { Tokens } from '../tokens/index';

export interface ContentProperties {
   
}


interface ContentStyles extends ContentProperties, DistributiveOmit<SystemStyleObject, keyof ContentProperties > {}

interface ContentPatternFn {
  (styles?: ContentStyles): string
  raw: (styles?: ContentStyles) => SystemStyleObject
}

/** A container that wraps content section */
export declare const content: ContentPatternFn;
