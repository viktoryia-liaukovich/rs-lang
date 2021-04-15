import React, { useEffect, useState } from "react";
import { Accordion, Button, Card, Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import { addWordToHard, deleteWord, getWords } from "../../utils/api/api";
import Cards from "../Card/Card";

import "./WordsList.scss";

export default function WordsList({ incomingWords, difficulty, page }) {
  const { translations, buttons } = useSelector((state) => state.settings);
  const [words, setWords] = useState(incomingWords);
  const { user } = useSelector((state) => state);

  useEffect(() => {
    if (!incomingWords) {
      getWords(difficulty, page).then((arr) => {
        setWords(arr);
      });
    }
    if (incomingWords) {
      setWords(incomingWords);
    }
  }, [difficulty, page, incomingWords]);

  return (
    <Container>
      <Accordion>
        {words &&
          words.map((el, i) => {
            return (
              <Card
                key={i}
                className="card-collapsed"
                bg={el.userWord && el.userWord.difficulty !== "normal" ? "danger" : "light"}
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
                        <Button
                          onClick={() => addWordToHard(user.userId, el.id)}
                          className="button-action"
                        >
                          Добавить в раздел "Сложные слова"
                        </Button>
                        <Button
                          className="button-action"
                          onClick={() => deleteWord(user.userId, el.id)}
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
