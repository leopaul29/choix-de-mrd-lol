import React from "react";
import "./Champion.css";

const Champion = ({ champion, result, nextStep, setNextStep, setLoading, setReload }) => {
  const { champData, imgsrc, champName } = champion;

  // --- Execute
  async function validateChampion(champion, setLoading) {
    // setLoading(true);
     if (!nextStep) setNextStep(!nextStep);
    // // --- get data

    // setLoading(false);
  }

  return (
    <div className="champion">
      <div className="champion_image">
        <img src={imgsrc} alt={champName} />
      </div>
      <button
        onClick={() => validateChampion(champData, setLoading)}
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
