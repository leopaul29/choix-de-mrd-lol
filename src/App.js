import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";
import Strawpoll from "./components/Strawpoll";

import {
  GET_ALL_QUESTIONS,
  GET_CHAMPION,
  GET_QUESTION_CHAMPION_COUNT,
  INSERT_CHAMPION,
  INSERT_QUESTION_CHAMPION_COUNT,
  UPDATE_QUESTION_CHAMPION_COUNT,
} from "./queries";

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
      uri: process.env.REACT_APP_GRAPHQL_URL,
      headers: {
        "x-hasura-admin-secret": process.env.REACT_APP_GRAPHQL_SECRET,
      },
    }),
    cache: new InMemoryCache(),
    defaultOptions: defaultOptions,
  });
};

function App() {
  const [client] = useState(createApolloClient());

  return (
    <ApolloProvider client={client}>
      <div className="app">
        <Strawpoll />
      </div>
    </ApolloProvider>
  );
}

export default App;
