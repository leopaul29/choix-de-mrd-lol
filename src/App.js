import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";

import { GRAPHQL_CONFIG } from "./graphql_variables.js";
import { GET_ALL_QUESTIONS } from "./gqlQueries";

const createApolloClient = (authToken) => {
  return new ApolloClient({
    link: new HttpLink({
      uri: authToken.url,
      headers: {
        "x-hasura-admin-secret": authToken.secret,
      },
    }),
    cache: new InMemoryCache(),
  });
};

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
  const [result1, setResult1] = useState("0%");
  const [result2, setResult2] = useState("0%");
  const [question, setQuestion] = useState({});
  const [questions, setQuestions] = useState([]);
  const [nextStep, setNextStep] = useState(false);
  const [client] = useState(createApolloClient(GRAPHQL_CONFIG));

  let dataQ = [
    {
      id: 0,
      question: "Which champ do you prefere on top lane?",
      champions: [],
    } /*,
    {
      id: 1,
      question: "Which champ do you prefere on jungle?",
      champions: [],
    }, 
    {
      id: 2,
      question: "Which champ do you prefere on mid lane?",
      champions: [],
    },
    {
      id: 3,
      question: "Which champ do you prefere on bottom adc lane?",
      champions: [],
    },
    {
      id: 4,
      question: "Which champ do you prefere on bottom support lane?",
      champions: [],
    },*/,
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

  async function getQuestions() {
    await client.query({ query: GET_ALL_QUESTIONS }).then((response) => {
      setQuestions(response.data.question);
    });
  }

  useEffect(() => {
    getLOLChampionData();
    getQuestions();
  }, []);

  useEffect(() => {
    //    setQuestion(dataQ[getRandomInt(dataQ.length)]);
  }, []);

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

    setChoice1(champions[keys[randomChoice1]]);
    setChoice2(champions[keys[randomChoice2]]);

    setQuestion(questions[getRandomInt(questions.length)]);
  }, [reload]);

  function chooseChampion(champion) {
    // cancel multiple reload before clicking on next button navigation
    if (!nextStep) setNextStep(!nextStep);
    /*
    // store champ/question data
    const idQ = question.id;
    const currentQ = dataQ[idQ];
    // champion list not empty
    if (currentQ?.champions?.length > 0) {
      // get current champions key list
      let championKeys = Object.keys(currentQ.champions);
      //check my current champion is in the list or not
      const championIndex = championKeys.indexOf(champion.name);
      if (championIndex > 0) {
        // add 1
        dataQ[idQ].champions[championIndex].count =
          dataQ[idQ].champions[championIndex].count + 1;
      } else {
        // add new champ
        dataQ[idQ].champions?.push({
          name: champion.name,
          count: 1,
        });
      }
    } else {
      // add new champ
      dataQ[idQ]?.champions?.push({
        name: champion.name,
        count: 1,
      });
    }

    // display results
    console.log(dataQ);
    const total1 = dataQ[idQ].champions[choice1.name]?.count;
    const total2 = dataQ[idQ].champions[choice2.name]?.count;
    if (total1 === 0) {
      setResult1(0 + "%");
      setResult2(100 + "%");
      return;
    } else if (total2 === 0) {
      setResult1(100 + "%");
      setResult2(0 + "%");
      return;
    } else {
      const percentRes1 = (total1 / (total1 + total2)) * 100;
      setResult1(percentRes1 + "%");
      setResult2(100 - percentRes1 + "%");
    }*/
  }

  function next(e) {
    e.preventDefault();
    setReload(!reload);
    setNextStep(!nextStep);
    setResult1("");
    setResult2("");
  }

  return (
    <ApolloProvider client={client}>
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
              <div className="result">{result1}</div>
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
              <div className="result">{result2}</div>
            </div>
          </div>
          <div className="nav">
            {nextStep && (
              <button className="next" onClick={(event) => next(event)}>
                Next
              </button>
            )}
            {!nextStep && <div className="question">{question.question}</div>}
          </div>
        </div>
      </div>
    </ApolloProvider>
  );
}
/*const RandomQuestion = () => {
  const { loading, error, data } = useQuery(GET_ALL_QUESTIONS);
  if (loading) {
    return "Loading ...";
  }
  if (error) {
    return "Error: " + error;
  }
  const question = data.question[getRandomInt(data.question.length)].question;
  return question;
};*/

export default App;
