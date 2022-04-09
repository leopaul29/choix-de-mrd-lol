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

const Strawpoll = ({ client }) => {
  const [champions, setChampions] = useState([]);
  const [reload, setReload] = useState(false);
  const [left, setLeft] = useState({});
  const [right, setRight] = useState({});
  const [result1, setResult1] = useState("0%");
  const [result2, setResult2] = useState("0%");
  const [loading, setLoading] = useState(false);
  const [nextStep, setNextStep] = useState(false);
  const [strawpolls, setStrawpolls] = useState([]);
  const [strawpoll, setStrawpoll] = useState();

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

    let leftChampion = champions[strawpoll.left];
    let rightChampion = champions[strawpoll.right];

    setLeft({
      champData: leftChampion,
      imgsrc: CHAMPION_PORTRAIT_URL(PATCH_VERSION, leftChampion?.key),
      champName: leftChampion?.name,
    });

    setRight({
      champData: rightChampion,
      imgsrc: CHAMPION_PORTRAIT_URL(PATCH_VERSION, rightChampion?.key),
      champName: rightChampion?.name,
    });
  }, [strawpoll]);

  useEffect(() => {
    if (strawpolls) {
      setStrawpoll(strawpolls[getRandomInt(strawpolls.length)]);
    }
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
          setReload={setReload}
        />
        <Champion
          champion={right}
          result={result2}
          nextStep={nextStep}
          setNextStep={setNextStep}
          setLoading={setLoading}
          setReload={setReload}
        />
      </div>
      <Nav
        loading={loading}
        question={strawpoll?.question}
        setResult1={setResult1}
        setResult2={setResult2}
        nextStep={nextStep}
        setNextStep={setNextStep}
        setReload={setReload}
        reload={reload}
      />
    </div>
  );
};

export default Strawpoll;
