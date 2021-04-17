import React, { useCallback, useEffect, useState } from "react";
import { Accordion, Button, Card, Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import { sectionsColor } from "../../utils/api";
import {
  addWordToHard,
  deleteWord,
  getLearningWords,
  removeWordFromHard,
} from "../../utils/api/api";
import { setActualWords } from "../../utils/games/setActualWords";
import Cards from "../Card/Card";

import "./WordsList.scss";

const separateLearningWords = (learningWords = [], wordGroup, wordPage) => {
  const result = [0, 0];
  learningWords.forEach((word, i) => {
    const { group, page } = word;
    if (group === wordGroup) result[0]++;
    if (group === wordGroup && page === wordPage) result[1]++;
  });
  return result;
};

export default function WordsList({ incomingWords, difficulty, page }) {
  const { translations, buttons } = useSelector((state) => state.settings);
  const [words, setWords] = useState(incomingWords);
  const [learningWords, setLearningWords] = useState(null);
  const { user } = useSelector((state) => state);

  const handleDeleteClick = useCallback(
    (userId, elId) => {
      deleteWord(userId, elId);
      setWords((words) => {
        return words.filter((word) => word.id !== elId);
      });
    },
    [setWords]
  );
  const handleRestoreClick = useCallback(
    (userId, elId) => {
      removeWordFromHard(userId, elId);
      setWords((words) => {
        return words.map((word) => {
          if (word.id === elId) word.userWord.difficulty = "normal";

          return word;
        });
      });
    },
    [setWords]
  );
  const handleToHardClick = (userId, elId) => {
      addWordToHard(userId, elId);
      setWords((words) => {
        return words.map((word) => {
          if (word.id === elId)  {
            if (word.userWord) {
              word.userWord.difficulty = "hard";
            } else {
              word.userWord = {}
              word.userWord.difficulty = "hard";
            }
          }

          return word;
        });
      });
    };

  useEffect(async () => {
    if (!incomingWords) {
      setActualWords(user && user.userId, setWords, difficulty, page, false, 1, true);
    } else {
      setWords(incomingWords);
    }
    if (user) {
      const learningWords = await getLearningWords(user.userId);
      setLearningWords(separateLearningWords(learningWords, difficulty, page));
    }
  }, [difficulty, page, incomingWords]);
  return (
    <Container style={{background: sectionsColor[difficulty]}}>
      <Accordion>
        {words && learningWords && (
          <div className="wordsList-stats">
            <p>вы изучаете {learningWords[0]} из 600 слов в данном разделе </p>
            <p>вы изучаете {learningWords[1]} из 30 слов на данной странице </p>
          </div>
        )}
        {words &&
          words.map((el, i) => {
            return (
              <Card
                key={i}
                className="card-collapsed"
                bg={el.userWord && el.userWord.difficulty !== "normal" ? "danger" : "light"}
                text={el.userWord && el.userWord.difficulty !== "normal" ? "light" : "dark"}
              >
                <Accordion.Toggle as={Card.Header} eventKey={i + 1} className="wordlist-item">
                  <p>{el.word}</p>
                  <p>{el.transcription}</p>
                  {translations && <p>{el.wordTranslate}</p>}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={i + 1}>
                  <div className="content">
                    <Card.Body>{Cards(el)}</Card.Body>
                    {buttons && user && (
                      <div className="buttons-wrapper">
                        {(!el.userWord || (el.userWord && el.userWord.difficulty !== "hard")) && (
                          <Button
                            onClick={() => handleToHardClick(user.userId, el.id)}
                            className="button-action"
                          >
                            Добавить в раздел "Сложные слова"
                          </Button>
                        )}
                        <Button
                          className="button-action"
                          onClick={() => handleDeleteClick(user.userId, el.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    )}
                  </div>
                </Accordion.Collapse>
              </Card>
            );
          })}
      </Accordion>
    </Container>
  );
}
