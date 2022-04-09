import React, { useState, useEffect } from "react";
import "./Champion.css";

import { INCREMENT_LEFT, INCREMENT_RIGHT } from "./../queries";

const Champion = ({
  champion,
  side,
  client,
  nextStep,
  setNextStep,
  strawpoll,
}) => {
  const { imgsrc, champName } = champion;

  const [result, setResult] = useState("0");

  useEffect(() => {
    if (strawpoll) {
      if (side === "left") {
        setResult(strawpoll.left_counter);
      } else {
        setResult(strawpoll.right_counter);
      }
    }
  }, [strawpoll]);

  async function validateChampion() {
    if (!nextStep) {
      if (side === "left") {
        setResult(strawpoll.left_counter + 1);
        client
          .query({
            query: INCREMENT_LEFT,
            variables: { id: strawpoll.id },
          })
          .then((response) => {
            setResult(response.data.update_strawpoll_by_pk?.left_counter);
          });
      } else {
        setResult(strawpoll.right_counter + 1);
        client
          .query({
            query: INCREMENT_RIGHT,
            variables: { id: strawpoll.id },
          })
          .then((response) => {
            setResult(response.data.update_strawpoll_by_pk?.right_counter);
          });
      }
      setNextStep(!nextStep);
    } else {
      setResult("");
    }
  }

  return (
    <div className="champion">
      <div className="champion_image">
        <img src={imgsrc} alt={champName} />
      </div>
      <button
        onClick={() => validateChampion()}
        className="champion_name"
        disabled={nextStep}
      >
        {champName}
      </button>
      {nextStep && <div className="result">{result}</div>}
    </div>
  );
};

export default Champion;
