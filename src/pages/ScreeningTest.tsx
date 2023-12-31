import { Fragment, useEffect, useRef, useState } from 'react';
import Button from '../components/common/Button';
import { keyframes, styled } from 'styled-components';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer';
import { useNavigate } from 'react-router';
import { Container } from '../components/common/Container';
import Step6 from './Step6';
import {
  ButtonContainer,
  PictureButton,
  Button as NumButton,
} from '../components/common/GameButton';
import { getRandomFloat } from '../utils/random';
import Splash from './Splash';
import { useModal } from '../hooks/useModal';
import LayerPopup from '../components/common/LayerPopup';
import { getErrorMessage } from '../utils/getErrorMessage';
import useSpeechToText from '../hooks/useSpeechToText';
import Header from '../components/common/Header';
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function ScreeningTest() {
  const { accessToken } = useSelector((state: RootState) => state.user);
  type Props = {
    step: number;
    audioUrl: string;
    description: string;
    screeningTestId: number;
    trial?: number;
    imgUrl?: string;
    timeLimit?: number;
    mikeOn?: boolean;
    hide?: boolean;
  };
  const [questions, setQuestions] = useState<Props[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trialCount, setTrialCount] = useState(10);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const audioTimer = useRef<number | null>(null);
  const stepCnt = 13;
  const navigate = useNavigate();
  const [firstVertex, setFirstVertex] = useState<number[]>([]);
  const [secondVertex, setSecondVertex] = useState<number[]>([]);
  const [candidates7, setCandidates7] = useState<string[]>([]);
  const buttonRefs7 = useRef<HTMLButtonElement[] | null[]>([]);
  const clickedTarget7 = useRef<string | null>(null);
  const [candidates8, setCandidates8] = useState<string[]>([]);
  const buttonRefs8 = useRef<HTMLButtonElement[] | null[]>([]);
  const clickedTarget8 = useRef<string | null>(null);
  const [candidates9, setCandidates9] = useState<string[]>([]);
  const buttonRefs9 = useRef<HTMLButtonElement[] | null[]>([]);
  const [clickedTargets9, setClickedTargets9] = useState(['', '']);
  const [answers9, setAnswers9] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetryAvailable, setIsRetryAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const { isModalOpen, modalText, openModal, closeModal } = useModal();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [finalSubmitLoading, setFinalSubmitLoading] = useState(false);
  const [recordingWaitingTime, setRecordingWaitingTime] = useState(3);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingWaitingDuration = useRef(3);
  const {
    transcript,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  } = useSpeechToText();

  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/patient/vitamins/screening-test`,
          {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (!data.isSuccess) {
          openModal(data.message);
          return;
        }
        setQuestions(data.result);
        const step7data = [
          '/assets/images/step7-1.png',
          '/assets/images/step7-2.png',
          '/assets/images/step7-3.png',
        ];
        setCandidates7([...step7data].sort(() => getRandomFloat() - 0.5));
        const step8data = [
          '/assets/images/step8-1.png',
          '/assets/images/step8-2.png',
          '/assets/images/step8-3.png',
          '/assets/images/step8-4.png',
        ];
        setCandidates8([...step8data].sort(() => getRandomFloat() - 0.5));

        const candidates9 = ['1', '2', '3', '5', '6', '7', '8', '9'];
        const randomSelection = [];
        while (randomSelection.length < 2) {
          const randomIndex = Math.floor(getRandomFloat() * candidates9.length);
          const selectedElement = candidates9.splice(randomIndex, 1)[0];
          randomSelection.push(selectedElement);
        }
        const step9data = [
          '4',
          '봄',
          '여름',
          '가을',
          '겨울',
          ...randomSelection,
        ];
        setCandidates9([...step9data].sort(() => getRandomFloat() - 0.5));
        setAnswers9(['4', '여름']);

        const audio = new Audio(data.result[currentIndex].audioUrl);
        audio.crossOrigin = 'use-credentials';
        audio.play();
        setCurrentAudio(audio);
        setRetryCoolTime(audio);
      } catch (error) {
        console.error(error);
        const axiosError = error as AxiosError;
        const errorMessage = getErrorMessage(axiosError);
        openModal(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    getData();

    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    stopCurrentAudio();
    stopAudioTimer();
  };

  const stopAudioTimer = () => {
    if (audioTimer.current) {
      clearTimeout(audioTimer.current);
    }
  };

  const stopRecording = () => {
    stopListening();
    abortListening();
  };

  const handleEachProblemAnswerSubmit = (audioContent: string | null) => {
    return new Promise((resolve) => {
      const submitAnswer = async () => {
        try {
          const { data } = await axios.post(
            `${
              import.meta.env.VITE_API_URL
            }/patient/vitamins/screening-test/detail`,
            {
              firstVertex,
              secondVertex,
              audioContent:
                audioContent && questions[currentIndex].step === 4
                  ? audioContent.replace(/\s+/g, '')
                  : audioContent,
              screeningTestId: questions[currentIndex].screeningTestId,
              count: retryCount,
            },
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
              },
            },
          );
          if (data.result.stop) {
            setTotalScore((prev) => prev + data.result.score);
            setRetryCount(0);
          } else {
            // 추가 질문 추가
            const newQuestions = questions;
            const additionalQuestion = {
              ...newQuestions[currentIndex],
              audioUrl: '',
              description: data.result.description,
            };
            newQuestions.splice(currentIndex + 1, 0, additionalQuestion);
            setQuestions(newQuestions);
            setRetryCount((prev) => prev + 1);
          }
          resolve(true);
        } catch (error) {
          console.error(error);
        }
      };
      submitAnswer();
    });
  };

  const handleStep6789Submit = async (step: number) => {
    if (step === 6) {
      await handleEachProblemAnswerSubmit(null);
    }
    if (step === 7 && clickedTarget7.current === '/assets/images/step7-2.png') {
      setTotalScore((prev) => prev + 1);
      setRetryCount(0);
    }
    if (step === 8 && clickedTarget8.current === '/assets/images/step8-4.png') {
      setTotalScore((prev) => prev + 1);
      setRetryCount(0);
    }
    if (step === 9) {
      if (clickedTargets9[0] === '4') {
        setTotalScore((prev) => prev + 1);
      }
      if (clickedTargets9[1] === '여름') {
        setTotalScore((prev) => prev + 1);
      }
      setRetryCount(0);
    }
  };

  const handleNextStep = async () => {
    setSubmitLoading(true);
    // 0. 이전 오디오 멈춤
    stopAudio();
    stopRecording();
    stopRecordingTimer();

    // 1. 답안 제출
    if (questions[currentIndex].mikeOn && !audioTimer.current) {
      // 1-1. 음성 제출인 경우
      try {
        // 현재 문제에 대한 오디오 파일 제출 -> 총 점수 갱신 or 추가 질문
        await handleEachProblemAnswerSubmit(transcript);
      } catch (error) {
        console.error(error);
      } finally {
        resetTranscript();
      }
    }
    // 1-2. 음성 제출이 아닌 경우
    handleStep6789Submit(questions[currentIndex].step);

    // 2. 다음 질문 음성 파일 재생
    const nextAudioUrl = questions[currentIndex + 1].audioUrl;

    if (nextAudioUrl) {
      const audio = new Audio(nextAudioUrl);
      audio.crossOrigin = 'use-credentials';
      audio.play();
      audio.addEventListener('loadedmetadata', (e) => {
        if (e.target) {
          const duration = (e.target as HTMLAudioElement).duration;
          const integerTime = Math.ceil(duration);
          setRecordingWaitingTime(integerTime);
          recordingWaitingDuration.current = integerTime;

          const timer = setInterval(() => {
            setRecordingWaitingTime((prevTime) => prevTime - 1);
          }, 1000);
          recordingTimerRef.current = timer;
        }
      });
      setCurrentAudio(audio);
      setRetryCoolTime(audio);
    } else {
      recordAgain();
    }

    // 3. 다시 듣기 횟수 갱신
    setTrialCount(questions[currentIndex + 1].trial ?? 10);

    // 4. 현재 스텝 갱신
    if (currentStep !== questions[currentIndex + 1].step) {
      setCurrentStep((prev) => prev + 1);
    }

    // 5. 현재 문제 인덱스 갱신
    setCurrentIndex((prev) => prev + 1);
    setSubmitLoading(false);
  };

  useEffect(() => {
    if (recordingWaitingTime === 0) {
      startListening();
      stopRecordingTimer();
    }
  }, [recordingWaitingTime]);

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const recordAgain = () => {
    stopListening();
    resetTranscript();
    setRecordingWaitingTime(3);
    recordingWaitingDuration.current = 3;

    const timer = setInterval(() => {
      setRecordingWaitingTime((prevTime) => prevTime - 1);
    }, 1000);
    recordingTimerRef.current = timer;
  };

  const onSubmit = async () => {
    stopListening();
    abortListening();
    setFinalSubmitLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/patient/vitamins/screening-test`,
        { score: totalScore },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );
      navigate('/screeningTestResult', {
        state: { cogLevel: data.result.cogLevel, totalScore },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setFinalSubmitLoading(false);
    }
  };

  const exitTest = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/patient/vitamins/screening-test`,
        { score: totalScore },
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      );
    } catch (error) {
      console.error(error);
    }
  };

  const convertNewlineToJSX = (inputString: string) => {
    const lines = inputString.split('\n');
    const jsxLines = lines.map((line, index) => (
      <Fragment key={line}>
        {line}
        {index !== lines.length - 1 && <br />}
      </Fragment>
    ));

    return jsxLines;
  };

  const handleListenAgain = () => {
    const currentAudioUrl = questions[currentIndex].audioUrl;

    if (currentAudioUrl) {
      const audio = new Audio(currentAudioUrl);
      audio.crossOrigin = 'use-credentials';
      audio.play();
      setCurrentAudio(audio);
      setRetryCoolTime(audio);
    }
    setTrialCount((prev) => prev - 1);
  };

  const setCurrentAudio = (audio: HTMLAudioElement) => {
    audioElement.current = audio;
  };

  const stopCurrentAudio = () => {
    if (audioElement.current) {
      audioElement.current.pause();
    }
  };

  const setRetryCoolTime = (audio: HTMLAudioElement) => {
    audio.addEventListener('loadedmetadata', (e) => {
      if (e.target) {
        const duration = (e.target as HTMLAudioElement).duration;
        setIsRetryAvailable(false);
        setTimeout(() => {
          setIsRetryAvailable(true);
        }, duration * 1000);
      }
    });
  };

  const initButtonStyle = (el: HTMLElement) => {
    el.style.backgroundColor = 'var(--main-color)';
    if (questions[currentIndex].step === 9) {
      el.style.border = '0.2rem solid var(--gray-bg-color)';
    } else {
      el.style.border = '0.2rem solid var(--black-color)';
    }
    el.style.color = 'white';
  };

  const activateButtonStyle = (el: HTMLElement) => {
    el.style.backgroundColor = 'var(--main-bg-color)';
    el.style.border = '0.2rem solid var(--main-color)';
    el.style.color = 'var(--main-color)';
  };

  const onClickButton = (
    target: string,
    el: HTMLElement,
    clickedTarget: React.MutableRefObject<string | null>,
    buttonRefs: React.MutableRefObject<HTMLButtonElement[] | null[]>,
  ) => {
    if (clickedTarget.current === target) {
      initButtonStyle(el);
      clickedTarget.current = null;
    } else {
      for (const buttonRef of buttonRefs.current) {
        if (buttonRef?.style.backgroundColor === 'var(--main-bg-color)') {
          initButtonStyle(buttonRef);
          break;
        }
      }
      activateButtonStyle(el);
      clickedTarget.current = target;
    }
  };

  const onClickButtonArray = (
    target: string,
    el: HTMLElement,
    clickedTargets: string[],
    buttonRefs: React.MutableRefObject<HTMLButtonElement[] | null[]>,
  ) => {
    if (clickedTargets.includes(target)) {
      initButtonStyle(el);
      const index = clickedTargets.findIndex((v) => v === target);
      const newClickedTargets = [...clickedTargets];
      newClickedTargets[index] = '';
      setClickedTargets9(newClickedTargets);
      return;
    }
    if (clickedTargets.every((v) => v)) {
      buttonRefs.current.forEach((el) => {
        if (el) {
          initButtonStyle(el);
        }
      });
      activateButtonStyle(el);
      setClickedTargets9([target, '']);
      return;
    }
    activateButtonStyle(el);
    const index = clickedTargets.findIndex((v) => !v);
    const newClickedTargets = [...clickedTargets];
    newClickedTargets[index] = target;
    setClickedTargets9(newClickedTargets);
  };

  const renderQuestion = (step: number) => {
    if (questions[currentIndex].hide || (step >= 6 && step <= 9)) {
      if (step === 3) {
        return '지금부터 외우셔야 하는 문장 하나를 불러드리겠습니다.';
      } else if (step === 4) {
        return '제가 불러드리는 숫자를 그대로 따라 해 주세요.';
      } else if (step === 5) {
        return '제가 불러드리는 말을 끝에서부터 거꾸로 따라 해 주세요.';
      } else if (step === 12) {
        return '제가 말씀드리는 대로 행동으로 따라해 주세요.';
      }
    } else if (step === 2) {
      return convertNewlineToJSX(
        questions[currentIndex].description.replace('살고계시는', '살고있는'),
      );
    } else {
      return convertNewlineToJSX(questions[currentIndex].description);
    }
  };

  const renderBottomButton = () => {
    if (currentStep === 0) {
      return (
        <Button text="다음" onClick={handleNextStep} loading={submitLoading} />
      );
    } else if (currentStep > stepCnt) {
      return (
        <Button
          text="검사 종료"
          onClick={onSubmit}
          loading={finalSubmitLoading}
        />
      );
    } else {
      return (
        <Button
          text="답변제출 / 다음"
          onClick={handleNextStep}
          loading={submitLoading}
        />
      );
    }
  };

  if (loading) return <Splash />;
  return (
    <Container>
      <Header label="검사 종료" onClick={exitTest} />
      <Wrapper>
        <ProgressBarWrapper>
          {Array.from({ length: stepCnt }, (_, i) => i).map((v, idx) => (
            <Circle
              style={{
                background:
                  idx + 1 <= currentStep ? 'var(--main-color)' : '#E1E1E1',
              }}
              key={v}
              $step={idx + 1}
              $currentStep={currentStep}>
              <span>{idx + 1}</span>
            </Circle>
          ))}
        </ProgressBarWrapper>
        <Box>
          {questions.length ? (
            <QuestionWrapper>
              <Question>
                {renderQuestion(questions[currentIndex].step)}
              </Question>
              {questions[currentIndex].mikeOn && (
                <>
                  {recordingWaitingTime > 0 ? (
                    <div style={{ width: '150px' }}>
                      <CircularProgressbarWithChildren
                        value={recordingWaitingTime}
                        maxValue={recordingWaitingDuration.current}
                        styles={buildStyles({
                          pathColor: 'var(--main-color)',
                          trailColor: 'var(--main-bg-color)',
                        })}
                        counterClockwise>
                        <RecordingTime>{recordingWaitingTime}</RecordingTime>
                      </CircularProgressbarWithChildren>
                    </div>
                  ) : (
                    <RecordingStateText>녹음중</RecordingStateText>
                  )}
                  <RecordingText>{transcript}</RecordingText>
                </>
              )}
              {questions[currentIndex].step === 6 && (
                <Step6Container>
                  <Step6Image alt="" src={questions[currentIndex].imgUrl} />
                  <Step6
                    setFirstVertex={setFirstVertex}
                    setSecondVertex={setSecondVertex}
                  />
                </Step6Container>
              )}
              {questions[currentIndex].step === 7 && (
                <Step7Container>
                  <Step7Image alt="" src={questions[currentIndex].imgUrl} />
                  <ButtonContainer>
                    {candidates7.map((v) => (
                      <PictureButton
                        key={v}
                        ref={(el) =>
                          (buttonRefs7.current[buttonRefs7.current.length] = el)
                        }
                        $imgUrl={v}
                        $isMedium={true}
                        onClick={(e) =>
                          onClickButton(
                            v,
                            e.target as HTMLButtonElement,
                            clickedTarget7,
                            buttonRefs7,
                          )
                        }
                      />
                    ))}
                  </ButtonContainer>
                </Step7Container>
              )}
              {questions[currentIndex].step === 8 && (
                <Step7Container>
                  <Step7Image alt="" src={questions[currentIndex].imgUrl} />
                  <ButtonContainer>
                    {candidates8.map((v) => (
                      <PictureButton
                        key={v}
                        ref={(el) =>
                          (buttonRefs8.current[buttonRefs8.current.length] = el)
                        }
                        $imgUrl={v}
                        $isMedium={true}
                        onClick={(e) =>
                          onClickButton(
                            v,
                            e.target as HTMLButtonElement,
                            clickedTarget8,
                            buttonRefs8,
                          )
                        }
                      />
                    ))}
                  </ButtonContainer>
                </Step7Container>
              )}
              {questions[currentIndex].step === 9 && (
                <Step7Container>
                  <Step7Image alt="" src={questions[currentIndex].imgUrl} />
                  <Step6Container>
                    {answers9.map((v, i) => (
                      <LetterBox key={v}>
                        <span>{clickedTargets9[i]}</span>
                      </LetterBox>
                    ))}
                  </Step6Container>
                  <ButtonContainer>
                    {candidates9.map((v) => (
                      <NumButton
                        key={v}
                        ref={(el) =>
                          (buttonRefs9.current[buttonRefs9.current.length] = el)
                        }
                        $isML={true}
                        onClick={(e) =>
                          onClickButtonArray(
                            v,
                            e.target as HTMLButtonElement,
                            clickedTargets9,
                            buttonRefs9,
                          )
                        }>
                        {v}
                      </NumButton>
                    ))}
                  </ButtonContainer>
                </Step7Container>
              )}
              {questions[currentIndex].step === 11 && (
                <Step11Image alt="" src={questions[currentIndex].imgUrl} />
              )}
              <BottomButtonContainer>
                {questions[currentIndex].step !== 11 && (
                  <ListenAgainButton
                    disabled={
                      !trialCount || !isRetryAvailable || !!recordingWaitingTime
                    }
                    onClick={handleListenAgain}>
                    다시 듣기
                  </ListenAgainButton>
                )}
                {questions[currentIndex].mikeOn && (
                  <ListenAgainButton
                    disabled={!!recordingWaitingTime}
                    onClick={recordAgain}>
                    다시 녹음하기
                  </ListenAgainButton>
                )}
              </BottomButtonContainer>
            </QuestionWrapper>
          ) : null}
        </Box>
        <ButtonWrapper>{renderBottomButton()}</ButtonWrapper>
      </Wrapper>
      {isModalOpen && (
        <LayerPopup
          label={modalText}
          centerButtonText="확인"
          onClickCenterButton={closeModal}
          closeModal={closeModal}
        />
      )}
    </Container>
  );
}

const Wrapper = styled.div`
  @media screen and (max-width: 767px) {
    padding: 1.6rem;
  }
`;

const Box = styled.div`
  width: 1700px;
  height: 800px;
  border-radius: 1.6rem;
  background: #fff;
  box-shadow: 1.5rem 1.3rem 2.8rem 0 rgba(0, 0, 0, 0.06);
  padding: 3rem;
  margin: 2.55rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 900px;
    height: 450px;
    margin: 2rem 0;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
    height: 530px;
    padding: 1.6rem;
    margin: 1.3rem 0;
  }
`;

const ProgressBarWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    gap: 2rem;
    margin: 20px 0 0 0;
  }
  @media screen and (max-width: 767px) {
    gap: 1rem;
  }
`;

const Circle = styled.div<{ $step: number; $currentStep: number }>`
  width: 8rem;
  height: 8rem;
  color: white;
  border: 0.5rem solid white;
  border-radius: 50%;
  font-size: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 44px;
    height: 44px;
    font-size: 2rem;
    border: 0.2rem solid white;
  }
  @media screen and (max-width: 767px) {
    width: 14px;
    height: 14px;
    font-size: 0.7rem;
    border: 0.1rem solid white;
  }
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -50%;
    width: 6rem;
    height: 1rem;
    background: ${(props) =>
      props.$step <= props.$currentStep
        ? 'linear-gradient(90deg, #FF9432 0%, #FFD4AD 100%)'
        : '#e1e1e1'};
    transform: translateY(-50%);
    z-index: -1;
    @media screen and (min-width: 768px) and (max-height: 1079px) {
      left: -70%;
      width: 3rem;
      height: 0.7rem;
    }
    @media screen and (max-width: 767px) {
      left: -110%;
      width: 1rem;
      height: 0.3rem;
    }
  }
  &:first-child::before {
    content: none;
  }
`;

const QuestionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 130rem;
  height: 100%;
  margin: 0 auto;
  align-items: center;
  border-bottom: 0.2rem solid #c6c6c6;
  padding: 4rem 0;
  gap: 3rem;
  &:last-child {
    border: none;
  }
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 60rem;
    padding: 2rem 0;
    gap: 1rem;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
    justify-content: space-between;
    padding: 0;
    gap: 0.5rem;
  }
`;

const Question = styled.p`
  font-size: 4rem;
  word-break: keep-all;
  font-family: 'Pretendard-Medium';
  line-height: 6rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 2.2rem;
    line-height: 3rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 1.6rem;
    margin: 0 0 1rem 0;
    line-height: 2.5rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
`;
const BottomButtonContainer = styled.div`
  display: flex;
  gap: 2rem;
`;
const ListenAgainButton = styled.button`
  width: 400px;
  background: var(--main-color);
  color: white;
  border-radius: 1.1rem;
  font-family: 'Pretendard-Bold';
  font-size: 3rem;
  padding: 2rem 4rem;
  &:disabled {
    background: #c6c6c6;
  }
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 250px;
    font-size: 1.6rem;
    padding: 1.4rem 2rem;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
    font-size: 1.6rem;
    padding: 1.4rem 2rem;
  }
`;
const Step6Container = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 767px) {
    gap: 1rem;
  }
`;
const Step6Image = styled.img`
  width: 600px;
  height: 600px;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 270px;
    height: 270px;
  }
  @media screen and (max-width: 767px) {
    width: 200px;
    height: 200px;
  }
`;
const Step7Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  @media screen and (max-width: 767px) {
    gap: 1rem;
  }
`;
const Step7Image = styled.img`
  width: 1700px;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 900px;
  }
  @media screen and (max-width: 767px) {
    width: 300px;
  }
`;
const LetterBox = styled.div`
  width: 160px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 3px solid green;
  font-size: 5rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 90px;
    height: 90px;
    font-size: 3rem;
  }
  @media screen and (max-width: 767px) {
    width: 80px;
    height: 80px;
    font-size: 2.4rem;
  }
`;
const Step11Image = styled.img`
  width: 350px;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 200px;
  }
  @media screen and (max-width: 767px) {
    width: 250px;
  }
`;
const RecordingText = styled.span`
  font-size: 5rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 2.4rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 2rem;
  }
`;
const RecordingTime = styled.span`
  line-height: 3rem;
  font-family: Pretendard-bold;
  font-size: 7rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 4rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 3rem;
  }
`;
const blinkAnimation = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;
const RecordingStateText = styled.span`
  line-height: 3rem;
  font-size: 4rem;
  color: red;
  animation: ${blinkAnimation} 2s infinite;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 2rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 1.6rem;
  }
`;

export default ScreeningTest;
