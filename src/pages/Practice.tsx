import { getQuestions } from "@/db";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import parse from "html-react-parser";
import "./Practice.css";
import AnswerOption from "@/components/AnswerOption";

export default function Practice() {
  const [index, setIndex] = useState(0);
  const [questionsArray, setQuestionsArray] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const temp = await getQuestions();
      if (cancelled == false) {
        setQuestionsArray(temp);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, []);
  if (questionsArray.length == 0) {
    return <p> loading...</p>;
  }
  const answerOptions: object[] = [];
  if (
    questionsArray[index]["content"]["type"] == "mcq" ||
    (questionsArray[index]["content"]["answer"] != undefined &&
      questionsArray[index]["content"]["answer"]["style"] == "Multiple Choice")
  ) {
    if (questionsArray[index]["content"]["answer"] != undefined) {
      console.log(questionsArray[index]["content"]["answer"]["choices"]);
    }

    const incrementChar = (c) => String.fromCharCode(c.charCodeAt(0) + 1);
    let temp = "a";
    if (questionsArray[index]["content"]["answerOptions"] != undefined) {
      questionsArray[index]["content"]["answerOptions"].forEach((option) => {
        answerOptions.push({ label: temp, text: option.content });
        temp = incrementChar(temp);
      });
    }
  }
  console.log(questionsArray[index]["questionId"]);
  console.log(
    questionsArray[index]["module"] == "math"
      ? questionsArray[index]["content"]["body"]
      : "",
  );

  let difficulty = "easy";
  if (questionsArray[index]["score_band_range_cd"] >= 3) difficulty = "medium";
  if (questionsArray[index]["score_band_range_cd"] >= 6) difficulty = "hard";
  return (
    <div className="question-container">
      <div className="question-details">
        <div className="button" style={{ justifyContent: "left" }}>
          <Link to="/">Home</Link>
        </div>
        <div className="timer">3:15</div>
        <div style={{ justifyContent: "right" }}>
          <span>Hide Details</span>
          <span>{questionsArray[index]["questionId"]}</span>
          <span>{questionsArray[index]["skill_desc"]}</span>
          <span className={difficulty}>
            {questionsArray[index]["score_band_range_cd"]}
          </span>
        </div>
      </div>
      <div className="question">
        <div
          className="passage-side"
          style={{
            display:
              questionsArray[index]["module"] == "math" ? "none" : "block",
          }}
        >
          {parse(
            questionsArray[index]["module"] == "english"
              ? questionsArray[index]["content"]["stimulus"]
              : ".",
          )}{" "}
        </div>
        <div className="answering-side">
          <div>
            {parse(
              questionsArray[index]["content"]["body"] != undefined
                ? questionsArray[index]["content"]["body"]
                : "",
            )}
          </div>
          <div>
            {parse(
              questionsArray[index]["content"][
                questionsArray[index]["module"] == "english" ? "stem" : "prompt"
              ],
            )}
          </div>
          {answerOptions.map((option) => {
            return <AnswerOption option={option}></AnswerOption>;
          })}
        </div>
      </div>
      <div className="under-question">
        <button>check</button>
        <button
          onClick={() => {
            setIndex((index) => index + 1);
          }}
        >
          next
        </button>
      </div>
    </div>
  );
}
