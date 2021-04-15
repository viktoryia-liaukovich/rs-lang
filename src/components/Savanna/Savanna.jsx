import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import "./Savanna.scss";

import SavannaStatistics from "./SavannaStatistics/SavannaStatistics";
import Drop from "./Drop/Drop";
import LivesCounter from "./LivesCounter/LivesCounter";
import { getRand } from "../../utils/games/getRand";
import { shuffle } from "../../utils/games/arrShuffle";
import {
  getWords,
  submitGameResult,
  submitRightAnswer,
  submitWrongAnswer,
} from "../../utils/api/api";

let interval;
let randomWords = [];
let crutch = false;

export default function Savanna() {
  const { user } = useSelector((state) => state);
  const [words, setWords] = useState([]);
  const [randomAnswers, setRandomAnswers] = useState([]);
  const [word, setWord] = useState();
  const [livesCount, setLivesCount] = useState(5);
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [wordPosition, setWordPosition] = useState(0);
  const [dropSize, setDropSize] = useState(100);
  const [rightAnswers, setRightAnswers] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [winStreak, setWinStreak] = useState(0);
  const [finalWinStreak, setFinalWinStreak] = useState(0);
  let { group, page } = useParams();
  function isGameOver() {
    return randomWords.length == 0 && rightAnswers.length + wrongAnswers.length == words.length;
  }

  function nextWord(words) {
    clearInterval(interval);

    if (!isGameOver() || (isGameOver() && isExactPage())) {
      setWordPosition(0);
      let word;
      if (randomWords.length == 0 && rightAnswers.length == 0 && wrongAnswers.length == 0) {
        randomWords = shuffle(words);
      }

      word = randomWords.pop();
      setWord(word);

      setRandomAnswers(getRandomAnswers(word.wordTranslate, words));
      interval = setInterval(() => {
        setWordPosition((wordPosition) => {
          if (wordPosition < 70) {
            return wordPosition + 0.05;
          }

          setLivesCount((livesCount) => {
            wrongAnswers.push(word);
            setWrongAnswers(wrongAnswers);
            if (livesCount - 1 > 0) {
              nextWord(words);
              return livesCount - 1;
            }
            return 0;
          });
          clearInterval(interval);
        });
      }, 1);
    } else {
      setLivesCount(0);
    }
  }

  // function getWords() {
  //   return fetch(
  //     `https://rs-lang-team-52.herokuapp.com/words?group=${group ? group : difficultyLevel}&page=${
  //       page ? page : getRand()
  //     }`
  //   )
  //     .then((res) => res.json())
  //     .then((words) => {
  //       setWords(words);
  //       return words;
  //     });
  // }

  const handleUserKeyPress = useCallback(({ key }) => {
    if (key > 0 && key <= 4) {
      var wordElement = document.querySelectorAll(`[data-key='${key}']`)[0];
      if (wordElement) {
        wordElement.dispatchEvent(
          new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true,
          })
        );
      }
    }
  }, []);

  useEffect(() => {
    getWords(group || difficultyLevel, page || getRand()).then((words) => {
      setWords(words);
      if (isExactPage()) {
        nextWord(words);
      }
    });

    window.addEventListener("keydown", handleUserKeyPress);

    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, []);

  function isExactPage() {
    return group && page;
  }

  let difficultySelector = "";
  if (!isExactPage()) {
    difficultySelector = (
      <div>
        <select
          className="form-control difficulty-level"
          onChange={(e) => {
            setDifficultyLevel(e.target.value);
            getWords(group || difficultyLevel, page || getRand()).then(() => {
              setWords(words);
              nextWord(words);
            });
            clearInterval(interval);
          }}
        >
          <option>Choose level</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
          <option>6</option>
        </select>
      </div>
    );
  }

  const handleClick = (answer, word) => {
    if (answer === word.wordTranslate) {
      user && submitRightAnswer(user.userId, word.id);
      rightAnswers.push(word);
      setRightAnswers(rightAnswers);
      setWinStreak((winStreak) => winStreak + 1);
      setDropSize(dropSize + 10);
      nextWord(words);
      return;
    }
    user && submitWrongAnswer(user.userId, word.id);
    wrongAnswers.push(word);
    setWrongAnswers(wrongAnswers);
    setFinalWinStreak((finalWinStreak) => {
      const streak = winStreak > finalWinStreak ? winStreak : finalWinStreak;
      setWinStreak(0);
      return streak;
    });
    setLivesCount(livesCount - 1);
    nextWord(words);
  };

  let gameField = "";
  let livesCounter = <LivesCounter livesCount={livesCount} />;
  if (isGameOver() || livesCount == 0) {
    if (user && finalWinStreak > 0) {
      clearInterval(interval);
      !crutch &&
        submitGameResult(
          user.userId,
          "savanna",
          finalWinStreak,
          rightAnswers.length,
          wrongAnswers.length
        );
      crutch = true;
    }
    gameField = <SavannaStatistics rightAnswers={rightAnswers} wrongAnswers={wrongAnswers} />;
    livesCounter = "";
  } else if (word) {
    gameField = (
      <>
        <div className="word" style={{ top: wordPosition + "%" }}>
          <p>{word.word}</p>
        </div>
        <ul className="words-list">
          {randomAnswers.map((answer, i) => {
            return (
              <li onClick={() => handleClick(answer, word)} key={i} data-key={i + 1}>
                {i + 1}. {answer}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className="savanna">
      {difficultySelector}
      {livesCounter}
      {gameField}
      <Drop dropSize={dropSize} />
    </div>
  );
}

// function getRandomWords(words) {
//   let previousIndexes = [];
//   let randomWords = [];
//   for (let i = 0; i < words.length; i++) {
//     randomWords.push(words[randomIndex(previousIndexes, words.length)]);
//   }
//   return randomWords;
// }

// function randomIndex(previousIndexes, seed) {
//   let index = Math.floor(Math.random() * seed);
//   if (previousIndexes.includes(index)) {
//     return randomIndex(previousIndexes, seed);
//   }
//   previousIndexes.push(index);
//   return index;
// }

function getRandomAnswers(answer, words) {
  let answers = [answer];
  do {
    const rand = Math.floor(Math.random() * words.length);
    let t = answers.filter((v) => {
      return v === words[rand].wordTranslate;
    });
    if (t.length == 0) {
      answers.push(words[rand].wordTranslate);
    }
  } while (answers.length < 4);

  return shuffle(answers);
}

// function shuffle(array) {
//   var currentIndex = array.length,
//     temporaryValue,
//     randomIndex;

//   while (0 !== currentIndex) {
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex -= 1;
//     temporaryValue = array[currentIndex];
//     array[currentIndex] = array[randomIndex];
//     array[randomIndex] = temporaryValue;
//   }

//   return array;
// }
