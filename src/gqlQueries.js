import { gql } from "@apollo/client";

export const GET_ALL_QUESTIONS = gql`
  query getQuestions {
    question {
      id
      question
    }
  }
`;

export const GET_QUESTION_CHAMPION_COUNT = gql`
  query getQuestionChampionCount($questionId: Int, $championName: String) {
    question_champion(
      where: {
        id_question: { _eq: $questionId }
        champion: { name: { _eq: $championName } }
      }
    ) {
      question {
        id
        question
      }
      champion {
        id
        name
      }
      count
    }
  }
`;

export const INSERT_CHAMPION = gql`
  mutation AddChampion($championName: String)) {
    insert_champion_one(object: { name: $championName }) {
      id
    }
  }
`;

export const INSERT_QUESTION_CHAMPION_COUNT = gql`
  mutation InsertQuestionChampionCount(
    $questionId: Int
    $championName: String
  ) {
    insert_question_champion_one(
      object: {
        id_question: { _eq: $questionId }
        champion: { name: { _eq: $championName } }
        count: 0
      }
    ) {
      id_question
      id_champion
      count
    }
  }
`;

export const UPDATE_QUESTION_CHAMPION_COUNT = gql`
  mutation IncrementChampionCount(
    $questionId: Int
    $championName: String
    $newCount: Int
  ) {
    update_question_champion(
      where: {
        id_question: { _eq: $questionId }
        champion: { name: { _eq: $championName } }
      }
      _set: { count: $newCount }
    ) {
      returning {
        count
      }
    }
  }
`;
