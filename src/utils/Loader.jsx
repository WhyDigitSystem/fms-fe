import React from "react";
import { ClipLoader } from "react-spinners"; // Importing ClipLoader from react-spinners
import { css } from "@emotion/react";

const loaderStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;  /* Full-screen loader */
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
`;

const Loader = ({ loading }) => {
  return (
    <div style={loaderStyle}>
      <ClipLoader color="#36D7B7" loading={loading} size={50} />
    </div>
  );
};

export default Loader;
