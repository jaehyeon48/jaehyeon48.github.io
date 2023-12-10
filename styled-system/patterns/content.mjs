import { mapObject } from '../helpers.mjs';
import { css } from '../css/index.mjs';

const contentConfig = {
transform() {
  return {
    position: "relative",
    mx: "auto",
    maxWidth: {
      base: "xl",
      md: "2xl",
      lg: "3xl",
      xl: "5xl"
    },
    px: {
      base: "16px",
      lg: 0
    }
  };
}}

export const getContentStyle = (styles = {}) => contentConfig.transform(styles, { map: mapObject })

export const content = (styles) => css(getContentStyle(styles))
content.raw = getContentStyle