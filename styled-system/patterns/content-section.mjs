import { mapObject } from '../helpers.mjs';
import { css } from '../css/index.mjs';

const contentSectionConfig = {
transform(props) {
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
    },
    ...props
  };
}}

export const getContentSectionStyle = (styles = {}) => contentSectionConfig.transform(styles, { map: mapObject })

export const contentSection = (styles) => css(getContentSectionStyle(styles))
contentSection.raw = getContentSectionStyle