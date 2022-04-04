import React from "react";
import Champion from "./Champion";
import Nav from "./Nav";
import "./Strawpoll.css";

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

const Strawpoll = () => {
  const [champions, setChampions] = useState([]);
  const [reload, setReload] = useState(false);
  const [left, setLeft] = useState({});
  const [right, setRight] = useState({});
  const [result1, setResult1] = useState("0%");
  const [result2, setResult2] = useState("0%");
  const [loading, setLoading] = useState(false);
  const [nextStep, setNextStep] = useState(false);

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

  // On load
  useEffect(() => {
    getLOLChampionData();
  }, []);

  // Setup champion data and random choice
  useEffect(() => {
    let keys = Object.keys(champions);
    keys = keys.slice(0, 2);
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

    setLeft(champions[keys[randomChoice1]]);
    setRight(champions[keys[randomChoice2]]);

    setQuestion(questions[getRandomInt(questions.length)]);
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
          CHAMPION_PORTRAIT_URL={CHAMPION_PORTRAIT_URL}
        />
        <Champion
          champion={right}
          result={result2}
          nextStep={nextStep}
          setNextStep={setNextStep}
          setLoading={setLoading}
          CHAMPION_PORTRAIT_URL={CHAMPION_PORTRAIT_URL}
        />
      </div>
      <Nav loading={loading} />
    </div>
  );
};

export default Strawpoll;
