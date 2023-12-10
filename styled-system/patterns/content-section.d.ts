/* eslint-disable */
import type { SystemStyleObject, ConditionalValue } from '../types/index';
import type { Properties } from '../types/csstype';
import type { PropertyValue } from '../types/prop-type';
import type { DistributiveOmit } from '../types/system-types';
import type { Tokens } from '../tokens/index';

export interface ContentSectionProperties {
   
}


interface ContentSectionStyles extends ContentSectionProperties, DistributiveOmit<SystemStyleObject, keyof ContentSectionProperties > {}

interface ContentSectionPatternFn {
  (styles?: ContentSectionStyles): string
  raw: (styles?: ContentSectionStyles) => SystemStyleObject
}

/** A container that wraps content section */
export declare const contentSection: ContentSectionPatternFn;
