import React from "react";
import "./Nav.css";

const Nav = ({ question, setResult1, setResult2, nextStep, setNextStep, loading, setReload, reload }) => {
  function next(e) {
    e.preventDefault();
    setReload(!reload);
    setNextStep(!nextStep);
    setResult1("");
    setResult2("");
  }

  return (
    <div className="nav">
      {nextStep && (
        <button
          className="next"
          onClick={(event) => next(event)}
          disabled={loading}
        >
          Next
        </button>
      )}
      {!nextStep && question && <div className="question">{question}</div>}
    </div>
  );
};

export default Nav;
