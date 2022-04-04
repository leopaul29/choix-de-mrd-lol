import React from "react";
const [question, setQuestion] = useState({});
const [questions, setQuestions] = useState([]);


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

// --- Request part
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


const temps = () => {
  return (
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
  );
};

export default temps;
