import React, { useState, useEffect } from "react";
import Champion from "./Champion";
import Nav from "./Nav";
import axios from "axios";
import "./Strawpoll.css";

import { GET_ALL_STRAWPOLL } from "./../queries";

const PATCH_VERSION = "9.3.1";
const CHAMPION_KEYS_URL = `https://ddragon.leagueoflegends.com/cdn/${PATCH_VERSION}/data/en_US/champion.json`;
const CHAMPION_PORTRAIT_URL = (patch, championKey) => {
  if (patch && championKey)
    return `https://cdn.communitydragon.org/${patch}/champion/${championKey}/portrait`;
  else return null;
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const Strawpoll = (client) => {
  const [champions, setChampions] = useState([]);
  const [reload, setReload] = useState(false);
  const [left, setLeft] = useState({});
  const [right, setRight] = useState({});
  const [result1, setResult1] = useState("0%");
  const [result2, setResult2] = useState("0%");
  const [loading, setLoading] = useState(false);
  const [nextStep, setNextStep] = useState(false);
  const [strawpolls, setStrawpolls] = useState([]);
  const [strawpoll, setStrawpoll] = useState([]);

  // --- Pre-set
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

  async function getAllStrawpolls() {
    await client.query({ query: GET_ALL_STRAWPOLL }).then((response) => {
      setStrawpolls(response.data.strawpoll);
      setStrawpoll(
        response.data.strawpoll[getRandomInt(response.data.strawpoll.length)]
      );
    });
  }

  // On load
  useEffect(() => {
    getLOLChampionData();
    getAllStrawpolls();
  }, []);

  // Setup champion data and random choice
  useEffect(() => {
    let keys = Object.keys(champions);
    keys = keys.slice(0, 2);
    if (keys.length === 0) {
      console.error("keys empty");
      return;
    }

    //let leftChampion =
    let randomChoice1 = getRandomInt(keys.length);
    let randomChoice2 = getRandomInt(keys.length);
    console.log("A: " + randomChoice1 + ", B: " + randomChoice2);
    while (randomChoice1 === randomChoice2) {
      randomChoice2 = getRandomInt(keys.length);
    }

    setLeft({
      champData: champions[keys[randomChoice1]],
      imgsrc: CHAMPION_PORTRAIT_URL(
        PATCH_VERSION,
        champions[keys[randomChoice1]]?.key
      ),
      champName: champions[keys[randomChoice1]]?.name,
    });

    setRight({
      champData: champions[keys[randomChoice2]],
      imgsrc: CHAMPION_PORTRAIT_URL(
        PATCH_VERSION,
        champions[keys[randomChoice2]]?.key
      ),
      champName: champions[keys[randomChoice2]]?.name,
    });

    //setQuestion(questions[getRandomInt(questions.length)]);
  }, [reload]);

  return (
    <div className="strawpoll">
      <div className="champion_choice">
        <Champion
          champion={left}
          result={result1}
          nextStep={nextStep}
          setNextStep={setNextStep}
          setLoading={setLoading}
        />
        <Champion
          champion={right}
          result={result2}
          nextStep={nextStep}
          setNextStep={setNextStep}
          setLoading={setLoading}
        />
      </div>
      <Nav loading={loading} />
    </div>
  );
};

export default Strawpoll;
