import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";

import {
  GET_ALL_QUESTIONS,
  GET_CHAMPION,
  GET_QUESTION_CHAMPION_COUNT,
  INSERT_CHAMPION,
  INSERT_QUESTION_CHAMPION_COUNT,
  UPDATE_QUESTION_CHAMPION_COUNT,
} from "./gqlQueries";

const defaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
  },
  query: {
    fetchPolicy: "no-cache",
  },
};

const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.GRAPHQL_CONFIG_URL,
      headers: {
        "x-hasura-admin-secret": process.env.GRAPHQL_CONFIG_SECRET,
      },
    }),
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
};

const CHAMPION_KEYS_URL =
  "https://ddragon.leagueoflegends.com/cdn/9.3.1/data/en_US/champion.json";
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
  // const [client] = useState(createApolloClient(GRAPHQL_CONFIG));
  const [client] = useState(createApolloClient());
  const [loading, setLoading] = useState(false);

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

  async function getQuestions() {
    await client.query({ query: GET_ALL_QUESTIONS }).then((response) => {
      setQuestions(response.data.question);
      setQuestion(
        response.data.question[getRandomInt(response.data.question.length)]
      );
    });
  }
  // On load
  useEffect(() => {
    getLOLChampionData();
    getQuestions();
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

    setChoice1(champions[keys[randomChoice1]]);
    setChoice2(champions[keys[randomChoice2]]);

    setQuestion(questions[getRandomInt(questions.length)]);
  }, [reload]);

  // --- Request part
  // Insert champion
  async function insertChampionQuestion(championName) {
    // get champ list
    await client
      .query({
        query: GET_CHAMPION,
        variables: { championName: championName },
      })
      .then((response) => {
        console.log(response);
        // add a new champ if not exist
        if (response.data.champion?.length === 0) {
          client.mutate({
            mutation: INSERT_CHAMPION,
            variables: { championName: championName },
          });
        }
      });
  }

  // Increment Count champion
  async function incrementChampionCount(questionId, championName) {
    await client
      .query({
        query: GET_QUESTION_CHAMPION_COUNT,
        variables: {
          questionId: questionId,
          championName: championName,
        },
      })
      .then((response) => {
        console.log("incrementChampionCount", response);
        const currentCount = response.data.question_champion[0]?.count;
        if (currentCount >= 0) {
          console.log("update");
          const newCount = currentCount + 1;
          client
            .mutate({
              mutation: UPDATE_QUESTION_CHAMPION_COUNT,
              variables: {
                questionId: questionId,
                championName: championName,
                newCount: newCount,
              },
            })
            .then(() => {
              getQuestionChampionCount(question.id, choice1.name, choice2.name);
            });
        } else {
          console.log("insert");
          client
            .query({
              query: GET_CHAMPION,
              variables: { championName: championName },
            })
            .then((response) => {
              const championId = response.data.champion[0]?.id;
              client
                .mutate({
                  mutation: INSERT_QUESTION_CHAMPION_COUNT,
                  variables: {
                    questionId: questionId,
                    championId: championId,
                  },
                })
                .then(() => {
                  getQuestionChampionCount(
                    question.id,
                    choice1.name,
                    choice2.name
                  );
                });
            });
        }
      });
  }

  // Get Question-champion
  async function getQuestionChampionCount(
    questionId,
    champion1Name,
    champion2Name
  ) {
    await client
      .query({
        query: GET_QUESTION_CHAMPION_COUNT,
        variables: {
          questionId: questionId,
          championName: champion1Name,
        },
      })
      .then((response) => {
        const res = response.data.question_champion[0]?.count;
        setResult1(res ? res : 0);
      });
    await client
      .query({
        query: GET_QUESTION_CHAMPION_COUNT,
        variables: {
          questionId: questionId,
          championName: champion2Name,
        },
      })
      .then((response) => {
        const res = response.data.question_champion[0]?.count;
        setResult2(res ? res : 0);
      });
  }

  // --- Execute
  async function chooseChampion(champion) {
    setLoading(true);
    if (!nextStep) setNextStep(!nextStep);
    // --- get data
    const questionId = question.id;
    const champion1Name = choice1.name;
    const champion2Name = choice2.name;

    // --- add both champ in db
    await insertChampionQuestion(champion1Name);
    await insertChampionQuestion(champion2Name);

    // --- increment count
    await incrementChampionCount(questionId, champion.name);

    setLoading(false);
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
                disabled={nextStep}
              >
                {choice1?.name}
              </button>
              {nextStep && <div className="result">{result1}</div>}
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
                disabled={nextStep}
              >
                {choice2?.name}
              </button>
              {nextStep && <div className="result">{result2}</div>}
            </div>
          </div>
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
            {!nextStep && question && (
              <div className="question">{question.question}</div>
            )}
          </div>
        </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
