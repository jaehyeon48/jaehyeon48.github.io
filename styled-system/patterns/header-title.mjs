import { mapObject } from '../helpers.mjs';
import { css } from '../css/index.mjs';

const headerTitleConfig = {
transform(props) {
  return {
    fontSize: {
      base: "24px",
      lg: "30px"
    },
    fontWeight: 700,
    marginTop: "4px",
    ...props
  };
}}

export const getHeaderTitleStyle = (styles = {}) => headerTitleConfig.transform(styles, { map: mapObject })

export const headerTitle = (styles) => css(getHeaderTitleStyle(styles))
headerTitle.raw = getHeaderTitleStyle