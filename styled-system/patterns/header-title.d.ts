/* eslint-disable */
import type { SystemStyleObject, ConditionalValue } from '../types/index';
import type { Properties } from '../types/csstype';
import type { PropertyValue } from '../types/prop-type';
import type { DistributiveOmit } from '../types/system-types';
import type { Tokens } from '../tokens/index';

export interface HeaderTitleProperties {
   
}


interface HeaderTitleStyles extends HeaderTitleProperties, DistributiveOmit<SystemStyleObject, keyof HeaderTitleProperties > {}

interface HeaderTitlePatternFn {
  (styles?: HeaderTitleStyles): string
  raw: (styles?: HeaderTitleStyles) => SystemStyleObject
}

/** A style for the title of the header */
export declare const headerTitle: HeaderTitlePatternFn;
