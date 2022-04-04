import React from "react";
import "./Champion.css";

const Champion = ({
  champion,
  result,
  nextStep,
  setNextStep,
  setLoading,
  CHAMPION_PORTRAIT_URL,
}) => {
  // --- Execute
  async function chooseChampion(champion, setLoading) {
    setLoading(true);
    if (!nextStep) setNextStep(!nextStep);
    // --- get data

    setLoading(false);
  }

  return (
    <div className="champion">
      <div className="champion_image">
        <img
          src={CHAMPION_PORTRAIT_URL(PATCH_VERSION, champion?.key)}
          alt={champion?.name}
        />
      </div>
      <button
        onClick={() => chooseChampion(champion, setLoading)}
        className="champion_name"
        disabled={nextStep}
      >
        {champion?.name}
      </button>
      {nextStep && <div className="result">{result}</div>}
    </div>
  );
};

export default Champion;
