import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
} from "@apollo/client";
import React, { useState } from "react";
import Strawpoll from "./components/Strawpoll";
import "./App.css";

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
        <Strawpoll client={client} />
      </div>
    </ApolloProvider>
  );
}

export default App;
