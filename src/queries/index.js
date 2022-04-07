import { gql } from "@apollo/client";

export const GET_ALL_QUESTIONS = gql`
  query getQuestions {
    question {
      id
      question
    }
  }
`;

export const GET_CHAMPION = gql`
  query getChampions($championName: String) {
    champion(where: { name: { _eq: $championName } }) {
      id
      name
    }
  }
`;

export const SUBSCRIBE_QUESTION_CHAMPION_COUNT = gql`
  query getQuestionChampionCount($questionId: Int, $championName: String) {
    question_champion(
      where: {
        champion: { name: { _eq: $championName } }
        id_question: { _eq: $questionId }
      }
    ) {
      id_question
      count
      id_champion
    }
  }
`;

export const GET_QUESTION_CHAMPION_COUNT = gql`
  query getQuestionChampionCount($questionId: Int, $championName: String) {
    question_champion(
      where: {
        champion: { name: { _eq: $championName } }
        id_question: { _eq: $questionId }
      }
    ) {
      id_question
      count
      id_champion
    }
  }
`;

export const INSERT_CHAMPION = gql`
  mutation AddChampion($championName: String) {
    insert_champion_one(object: { name: { _eq: $championName } }) {
      id
    }
  }
`;

export const INSERT_QUESTION_CHAMPION_COUNT = gql`
  mutation InsertQuestionChampionCount($championId: Int, $questionId: Int) {
    insert_question_champion_one(
      object: { id_question: $questionId, count: 1, id_champion: $championId }
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

export const GET_ALL_STRAWPOLL = gql`
  query getAllStrawpoll {
    strawpoll {
      id
      left
      right
      question
      left_counter
      right_counter
    }
  }
`;
