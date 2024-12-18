import { Box } from "zmp-ui";
import React from "react";
import styled from "styled-components";

const StyledBox = styled(Box)`
  min-height: ${(props) => props.size || 8}px;
  background-color: var(--zmp-background-color);
`;

const Divider = ({ size = 8, className, ...props }) => {
  return (
    <StyledBox
      className={className}
      {...props}
    />
  );
};

export default Divider;