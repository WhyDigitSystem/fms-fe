import { Empty } from "antd";
import React from "react";
import NoDataAvailable from "./NoDataAvailable";

const NoDataFallback = ({ onRetry }) => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      {/* <Empty description="No Pending Approval" /> */}
      <NoDataAvailable message="No records to display" />
      {/* {onRetry && (
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      )} */}
    </div>
  );
};

export default NoDataFallback;
