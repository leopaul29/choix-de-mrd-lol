import React from "react";
import "./Nav.css";

const Nav = ({ question,  nextStep, setNextStep, loading, setReload, reload }) => {
  function next(e) {
    e.preventDefault();
    setReload(!reload);
    setNextStep(!nextStep);
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
