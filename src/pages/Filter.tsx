import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TopicSelection from "@/components/TopicSelection";
import MonthCalendar from "@/components/MonthCalendar";
import "./Filter.css";
import { topicCodes } from "@/components/TopicTree";
const sampleData = {
  "2026-08-02": 5,
  "2026-08-05": 12,
  "2026-08-10": 3,
  "2026-08-14": 25, // Highest intensity
  "2026-08-18": 18,
  "2026-08-22": 9,
  "2026-08-28": 15,
};

function Filter() {
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(new Set([2,3,4,5, 6,7]));
  const [solvedStatus, setSolvedStatus] = useState("all");
  const [selected, setSelected] = useState(new Set());
  function editDifficulty(numbers: number[], forced = false) {
    const nextDifficulty = new Set(difficulty);
    let allOn: boolean = true;
    if (forced) {
      for (const number of numbers) {
        if (difficulty.has(number) == false) {
          allOn = false;
          break;
        }
      }
    }
    for (const number of numbers) {
      if (forced == false) {
        if (nextDifficulty.has(number)) nextDifficulty.delete(number);
        else nextDifficulty.add(number);
      } else {
        if (allOn) {
          nextDifficulty.delete(number);
        } else nextDifficulty.add(number);
      }
    }
    setDifficulty(nextDifficulty);
    console.log(nextDifficulty);
  }

  async function editFilters() {
    const topics = [];
    for (const topic of selected) {
      topics.push(topicCodes[topic as keyof typeof topicCodes]);
    }
    const temp = [];
    for (const level of difficulty) {
      temp.push(level);
    }
    const filtersObject = {
      subtopics: topics,
      difficultyLevels: temp,
      solvedStatus: solvedStatus,
    };

    sessionStorage.setItem("filters", JSON.stringify(filtersObject));

    navigate("/practice");
  }

  function genDiffCircle(diffNum: number) {
    let color = "#9e827b";
    if (diffNum <= 2) color = "#688f7a";
    else if (diffNum >= 6) color = "#a26273";

    return (
      <div
        className={`difficulty-circle ${difficulty.has(diffNum) && "checked"}`}
        onClick={() => editDifficulty([diffNum])}
        type="checkbox"
        style={{ borderColor: color, backgroundColor: color }}
      />
    );
  }
  return (
    <>
      <h2 style={{ fontSize: "52px", color: "#2a4363" }}>
        Mornin, Basel
        <span style={{ fontSize: "24px", color: "#4a5c79", marginLeft: "8px" }}>
          Let's lock in
        </span>
      </h2>

      <div className="main-container">
        <div className="past-record">
          <MonthCalendar
            activityData={sampleData}
            themeColor="#243a5c"
            showMonthLabel={false}
            showWeekdayLabels={false}
            showNavButtons={false}
            showLegend={false}
            maxWidth="300px" // Increases physical size of grid cells!
          />
          <button className="button">Statistics</button>
        </div>
        <TopicSelection
          selected={selected}
          setSelected={setSelected}
          difficulty={difficulty}
          solvedStatus={solvedStatus}
        ></TopicSelection>
        <div className="filtering-container">
          <div className="filtering">
            <h2>Difficulty</h2>
            <h2>solved status</h2>
            <div style={{ textTransform: "capitalize" }}>
              {["all", "unsolved"].map((ele) => {
                return (
                  <label
                    key={ele}
                    className={`difficulty-checkbox ${solvedStatus == ele && "checked"}`}
                  >
                    {" "}
                    {ele}{" "}
                    <input
                      type="radio"
                      style={{ display: "none" }}
                      onClick={() => {
                        setSolvedStatus(ele);
                      }}
                    />
                  </label>
                );
              })}
            </div>
            <h2>Difficutly (1→7)</h2>
            <div style={{ display: "flex", alignItems: "center" }}>
              <label
                onClick={() => {
                  editDifficulty([1, 2], true);
                }}
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  className={`difficulty-checkbox ${[1, 2].every((num) => difficulty.has(num)) && "all-on"}`}
                />
                <span style={{ marginInline: "5px" }}>Easy</span>
              </label>
              {genDiffCircle(1)}
              {genDiffCircle(2)}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <label
                onClick={() => {
                  editDifficulty([3, 4, 5], true);
                }}
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  className={`difficulty-checkbox ${[3, 4, 5].every((num) => difficulty.has(num)) && "all-on"}`}
                />
                <span style={{ marginInline: "5px" }}>Medium</span>
              </label>
              {genDiffCircle(3)}
              {genDiffCircle(4)}
              {genDiffCircle(5)}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <label
                onClick={() => {
                  editDifficulty([6, 7], true);
                }}
                style={{ display: "flex", alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  className={`difficulty-checkbox ${[6, 7].every((num) => difficulty.has(num)) && "all-on"}`}
                />
                <span style={{ marginInline: "5px" }}>Hard</span>
              </label>
              {genDiffCircle(6)}
              {genDiffCircle(7)}
            </div>
          </div>
          <button onClick={editFilters} className="button">
            Start{" "}
          </button>
        </div>
      </div>
    </>
  );
}

export default Filter;
