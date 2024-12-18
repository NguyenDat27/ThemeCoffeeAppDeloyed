import { Box, Header, Text } from "zmp-ui";
import logo from "../../static/logo.png";
import appConfig from "../../../app-config.json";
import React from "react";

const Welcome = () => {
  return (
    <Header
      className="app-header no-border pl-4 flex-none pb-[6px]"
      showBackIcon={false}
      title={
        <Box flex alignItems="center" className="space-x-2">
          <img
            className="w-8 h-8 rounded-lg border-inset"
            src={logo}
            alt="App Logo"
          />
          <Box>
            <Text.Title size="small">{appConfig.app.title}</Text.Title>
          </Box>
        </Box>
      }
    />
  );
};

export default Welcome;
