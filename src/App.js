import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";

const CHAMPION_KEYS_URL =
  "http://ddragon.leagueoflegends.com/cdn/9.3.1/data/en_US/champion.json";
const PATCH_VERSION = "9.3.1";
const CHAMPION_PORTRAIT_URL = (patch, championKey) => {
  if (patch && championKey)
    return `https://cdn.communitydragon.org/${patch}/champion/${championKey}/portrait`;
  else return null;
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function App() {
  const [champions, setChampions] = useState([]);
  const [reload, setReload] = useState(false);
  const [choice1, setChoice1] = useState({});
  const [choice2, setChoice2] = useState({});
  const [question, setQuestion] = useState({});
  const [nextStep, setNextStep] = useState(false);

  const dataQ = [
    {
      id: 0,
      question: "Which champ do you prefere on top lane?",
    },
    {
      id: 1,
      question: "Which champ do you prefere on jungle?",
    },
    {
      id: 2,
      question: "Which champ do you prefere on mid lane?",
    },
    {
      id: 3,
      question: "Which champ do you prefere on bottom adc lane?",
    },
    {
      id: 4,
      question: "Which champ do you prefere on bottom support lane?",
    },
  ];

  async function getLOLChampionData() {
    await axios
      .get(CHAMPION_KEYS_URL)
      .then((response) => {
        setChampions(response.data.data);
        setReload(true);
      })
      .catch((error) => {
        console.error("Error fetching data; ", error);
        console.error(error);
      });
  }

  useEffect(() => {
    getLOLChampionData();
  }, []);

  useEffect(() => {
    setQuestion(dataQ[getRandomInt(dataQ.length)]);
  }, []);

  useEffect(() => {
    let keys = Object.keys(champions);
    if (keys.length === 0) {
      console.error("keys empty");
      return;
    }

    let randomChoice1 = getRandomInt(keys.length);
    let randomChoice2 = getRandomInt(keys.length);
    console.log("A: " + randomChoice1 + ", B: " + randomChoice2);
    while (randomChoice1 === randomChoice2) {
      randomChoice2 = getRandomInt(keys.length);
    }

    setChoice1(champions[keys[randomChoice1]]);
    setChoice2(champions[keys[randomChoice2]]);
  }, [reload]);

  function chooseChampion(champion) {
    // cancel multiple reload before clicking on next button navigation
    if (!nextStep) setNextStep(!nextStep);

    // store champ/question data

    // display results
  }

  function next() {
    setReload(!reload);
    setNextStep(!nextStep);
  }

  return (
    <div className="app">
      <div className="champions">
        <div className="champ_choice">
          <div className="champ_left">
            <div className="champ_image">
              <img
                src={CHAMPION_PORTRAIT_URL(PATCH_VERSION, choice1?.key)}
                alt="champion1"
              />
            </div>
            <button
              onClick={() => chooseChampion(choice1)}
              className="champion_name"
            >
              {choice1?.name}
            </button>
          </div>
          <div className="champ_right">
            <div className="champ_image">
              <img
                src={CHAMPION_PORTRAIT_URL(PATCH_VERSION, choice2?.key)}
                alt="champion2"
              />
            </div>
            <button
              onClick={() => chooseChampion(choice2)}
              className="champion_name"
            >
              {choice2?.name}
            </button>
          </div>
        </div>
        <div className="nav">
          {nextStep && (
            <button className="next" onClick={() => next()}>
              Next
            </button>
          )}
          {!nextStep && <div className="question">{question.question}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
