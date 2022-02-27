import { gql } from "@apollo/client";

export const GET_ALL_QUESTIONS = gql`
  query getQuestions {
    question {
      id
      question
    }
  }
`;
