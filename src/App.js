import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
  gql,
} from "@apollo/client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";

import { GRAPHQL_CONFIG } from "./graphql_variables.js";
import {
  GET_ALL_QUESTIONS,
  GET_QUESTION_CHAMPION_COUNT,
  INSERT_CHAMPION,
  INSERT_QUESTION_CHAMPION_COUNT,
  UPDATE_QUESTION_CHAMPION_COUNT,
} from "./gqlQueries";

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
  const [finalChoice, setfinalChoice] = useState({});
  const [result1, setResult1] = useState("0%");
  const [result2, setResult2] = useState("0%");
  const [question, setQuestion] = useState({});
  const [questions, setQuestions] = useState([]);
  const [nextStep, setNextStep] = useState(false);
  const [client] = useState(createApolloClient(GRAPHQL_CONFIG));
  const [state, setState] = useState({});

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
        setResult1(response.data.question_champion[0]?.count);
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
        setResult2(response.data.question_champion[0]?.count);
      });
  }
  // Insert champion
  async function insertChampionQuestion(questionId, championName) {
    await client.mutate({
      mutation: INSERT_CHAMPION(championName),
    });
    // .then((response) => {
    //   if (response.errors) console.error(response.errors[0]?.message);
    // });
    await client.mutate({
      mutation: INSERT_QUESTION_CHAMPION_COUNT,
      variables: {
        questionId: questionId,
        championName: championName,
      },
    });
  }
  // Increment Count champion
  async function incrementChampionCount(questionId, championName, newCount) {
    await client.mutate({
      mutation: UPDATE_QUESTION_CHAMPION_COUNT,
      variables: {
        questionId: questionId,
        championName: championName,
        newCount: newCount,
      },
    });
    // .then((response) => {
    //   if (response.errors) console.error(response.errors[0]?.message);
    // });
  }

  // --- Execute
  async function chooseChampion(champion) {
    if (!nextStep) setNextStep(!nextStep);
    // --- get data
    const questionId = question.id;
    const champion1Name = choice1.name;
    const champion2Name = choice2.name;

    // --- add both champ in db
    await insertChampionQuestion(questionId, champion1Name);
    await insertChampionQuestion(questionId, champion2Name);

    // --- get both count
    /*const countChampion1 = await getQuestionChampionCount(
      questionId,
      champion1Name
    );
    const countChampion2 = await getQuestionChampionCount(
      questionId,
      champion2Name
    );*/
    incrementChampionCount(questionId, champion.name, state.currentCount + 1);

    getQuestionChampionCount(questionId, champion1Name, champion2Name);
    /*    // champion list not empty
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
/*
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
    /*setResult1("XX");
    setResult2("YY");*/
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
                disabled={nextStep}
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
            {!nextStep && question && (
              <div className="question">{question.question}</div>
            )}
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
