import React from "react";
import { Endpoints } from "@octokit/types";

export default async function Git() {
  const getData = async () => {
    try {
      const response = await fetch(
        `https://api.github.com/users/trippwastaken`,
        {
          cache: "no-store",
        }
      );
      return await response.json();
    } catch (error) {
      console.log(`Something along the way broke whoops! Error code: ${error}`);
    }
  };
  const gitProfile = getData()
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      return null;
    });

  return <div>Git</div>;
}
