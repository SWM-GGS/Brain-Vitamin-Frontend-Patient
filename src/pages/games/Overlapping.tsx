import { useEffect } from 'react';
import {
  Container,
  Text,
  NumWrapper,
  Num,
  ButtonWrapper,
  NumBtn,
} from '../../components/games/Overlapping';
import { GameProps } from '../../routes/gameRouter.tsx';
import { AnswerFeedback } from '../../components/common/AnswerFeedback.tsx';
import { styled } from 'styled-components';
import { getRandomFloat } from '../../utils/random.ts';
import { useGameLogic } from '../../hooks/useGameLogic.ts';

/**
 * 난도별 겹쳐진 숫자의 개수 상이
 * 하 : 2
 * 중 : 3
 * 상 : 4
 */
export default function Overlapping({
  gameData,
  onGameEnd,
  saveGameResult,
  isNextButtonClicked,
  setAnswerState,
  answerState,
}: Readonly<GameProps>) {
  const difficulty = gameData.difficulty;
  const { onClickButton, setAnswers, buttonRefs, showAnswer, answers } =
    useGameLogic<number>(
      {
        gameData,
        onGameEnd,
        saveGameResult,
        isNextButtonClicked,
        setAnswerState,
        answerState,
      },
      undefined,
      true,
      undefined,
      undefined,
      undefined,
      true,
    );

  useEffect(() => {
    let newAnswer: number[] = [];
    while (newAnswer.length < difficulty + 1) {
      newAnswer.push(Math.floor(getRandomFloat() * 10));
      newAnswer = [...new Set(newAnswer)];
    }
    setAnswers(newAnswer);
  }, []);

  return (
    <>
      <Container>
        <Text>
          겹쳐진 {answers.length}개의 숫자를 보고 있습니다. 어떤 숫자인가요?
        </Text>
        <NumWrapper>
          {answers.map((num) => (
            <Num
              key={num}
              $top={50 + Math.floor(getRandomFloat() * 8)}
              $left={50 + Math.floor(getRandomFloat() * 8)}>
              {num}
            </Num>
          ))}
        </NumWrapper>
        <ButtonWrapper>
          {Array.from({ length: 10 }, (_, i) => i).map((v) => (
            <NumBtn
              key={v}
              ref={(el) => (buttonRefs.current[buttonRefs.current.length] = el)}
              onClick={(e) => onClickButton(v, e.target as HTMLButtonElement)}>
              {v}
            </NumBtn>
          ))}
        </ButtonWrapper>
      </Container>
      {showAnswer && (
        <AnswerFeedback>
          <ShowAnswer>
            <p>
              정답은 [
              {answers.map((v, i) => {
                if (i === answers.length - 1) return v;
                return `${v}, `;
              })}
              ]입니다.
            </p>
          </ShowAnswer>
        </AnswerFeedback>
      )}
    </>
  );
}

const ShowAnswer = styled.div`
  font-size: 5rem;
  width: 50rem;
  height: 50rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--main-bg-color);
  border-radius: 1.3rem;
  box-shadow: 15px 13px 28px 0px rgba(0, 0, 0, 0.06);
  padding: 4rem;
  word-break: keep-all;
  text-align: center;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 2.4rem;
    width: 25rem;
    height: 25rem;
    padding: 2rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 2rem;
    width: 20rem;
    height: 20rem;
    padding: 2rem;
  }
`;
