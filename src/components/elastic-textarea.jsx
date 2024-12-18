import { useEffect, useRef, useCallback } from "react";
import { tripUnit } from "../utils/dom";
import React from "react";

const adjustHeight = (el, maxRows) => {
  if (!el) return;

  const styles = window.getComputedStyle(el);
  const lineHeight = tripUnit(styles.lineHeight);
  const maxHeight = (maxRows ?? 1) * lineHeight;

  el.style.minHeight = "0px";
  if (maxHeight && maxHeight < el.scrollHeight) {
    el.style.minHeight = `${maxHeight}px`;
  } else {
    el.style.minHeight = `${el.scrollHeight}px`;
  }
};

const StyledTextarea = styled.textarea`
  height: auto;
  padding-top: 0;
  padding-bottom: 0;
  resize: none;
  overflow: hidden;
  min-height: ${(props) => props.minHeight || "auto"};
`;

const ElasticTextarea = ({ onChange, maxRows, ...props }) => {
  const ref = useRef(null);

  const handleInputChange = useCallback(
    (e) => {
      if (onChange) {
        onChange(e);
      }
      adjustHeight(e.currentTarget, maxRows);
    },
    [onChange, maxRows]
  );

  useEffect(() => {
    if (ref.current) {
      adjustHeight(ref.current, maxRows);
    }
  }, [maxRows]);

  return (
    <StyledTextarea
      {...props}
      ref={ref}
      rows={1}
      onChange={handleInputChange}
    />
  );
};

export default ElasticTextarea;
