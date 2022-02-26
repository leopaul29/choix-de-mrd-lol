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

  async function getLOLChampionData() {
    await axios
      .get(CHAMPION_KEYS_URL)
      .then((response) => {
        setChampions(response.data.data);
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
    let keys = Object.keys(champions);
    if (keys.length === 0) {
      console.error("keys empty");
      return;
    }

    let randomChoice1 = getRandomInt(keys.length);
    let randomChoice2 = getRandomInt(keys.length);
    console.log("1: " + randomChoice1 + ", 2: " + randomChoice2);
    while (randomChoice1 === randomChoice2) {
      randomChoice2 = getRandomInt(keys.length);
    }

    setChoice1(champions[keys[randomChoice1]]);
    setChoice2(champions[keys[randomChoice2]]);
    setReload(false);
  }, [reload]);

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
          <button className="champion_name">{choice1?.name}</button>
        </div>
        <div className="champ_right">
          <div className="champ_image">
            <img
          src={CHAMPION_PORTRAIT_URL(PATCH_VERSION, choice2?.key)}
          alt="champion2" 
          />
          </div>
          <button className="champion_name">{choice2?.name}</button>
        </div>
      </div>
      <button className="next" onClick={() => setReload(true)}>Next</button>
          </div>
    </div>
  );
}

export default App;
