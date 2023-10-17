import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Button from '../components/common/Button';
import { styled } from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer';
import { useNavigate } from 'react-router';
import { Container } from '../components/common/Container';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { generateUniqueNumber } from '../modules/generateUniqueNumber';
import { FetchHttpHandler } from '@smithy/fetch-http-handler';
import Step6 from './Step6';
import {
  ButtonContainer,
  PictureButton,
} from '../components/common/GameButton';

function ScreeningTest() {
  const accessToken = useSelector((state: RootState) => state.user.accessToken);
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
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );
  const stepCnt = 13;
  const navigate = useNavigate();
  const [firstVertex, setFirstVertex] = useState<number[]>([]);
  const [secondVertex, setSecondVertex] = useState<number[]>([]);
  const [candidates7, setCandidates7] = useState<string[]>([]);
  const buttonRefs7 = useRef<HTMLButtonElement[] | null[]>([]);
  const clickedTarget7 = useRef<string | null>(null);

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
        setQuestions(data.result);
        setCandidates7([
          '/assets/images/step7-1.png',
          '/assets/images/step7-2.png',
          '/assets/images/step7-3.png',
        ]);

        const audio = new Audio(data.result[currentIndex].audioUrl);
        audio.play();
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  }, []);

  const [stream, setStream] = useState<MediaStream>();
  const [media, setMedia] = useState<MediaRecorder>();
  const [source, setSource] = useState<MediaStreamAudioSourceNode>();
  const [analyser, setAnalyser] = useState<ScriptProcessorNode>();

  const onRecAudio = () => {
    // 음원정보를 담은 노드를 생성하거나 음원을 실행또는 디코딩 시키는 일을 한다
    const audioCtx = new window.AudioContext();
    // 자바스크립트를 통해 음원의 진행상태에 직접접근에 사용된다.
    const analyser = audioCtx.createScriptProcessor(0, 1, 1);
    setAnalyser(analyser);

    function makeSound(stream: MediaStream) {
      // 내 컴퓨터의 마이크나 다른 소스를 통해 발생한 오디오 스트림의 정보를 보여준다.
      const source = audioCtx.createMediaStreamSource(stream);
      setSource(source);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    // 마이크 사용 권한 획득
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      setStream(stream);
      setMedia(mediaRecorder);
      makeSound(stream);
    });
  };

  // 사용자가 음성 녹음을 중지했을 때
  const offRecAudio = () => {
    return new Promise((resolve, reject) => {
      if (!media || !stream || !analyser || !source) {
        reject(new Error('offRecAudio failed'));
        return;
      }

      // 모든 트랙에서 stop()을 호출해 오디오 스트림을 정지
      stream.getAudioTracks().forEach(function (track) {
        track.stop();
      });

      // 미디어 캡처 중지
      media.stop();
      // 메서드가 호출 된 노드 연결 해제
      analyser.disconnect();
      source.disconnect();

      // dataavailable 이벤트로 Blob 데이터에 대한 응답을 받을 수 있음
      media.ondataavailable = function (e) {
        resolve(e.data);
      };
    });
  };

  const onSubmitAudioFile = useCallback((audioUrl: Blob) => {
    return new Promise((resolve, reject) => {
      if (!audioUrl) {
        reject(new Error('audioUrl not found'));
        return;
      }
      console.log(URL.createObjectURL(audioUrl)); // 출력된 링크에서 녹음된 오디오 확인 가능

      // File 생성자를 사용해 파일로 변환
      const sound = new File([audioUrl], 'soundBlob', {
        lastModified: new Date().getTime(),
        type: 'audio',
      });
      console.log(sound); // File 정보 출력

      // 음성 파일을 s3에 업로드
      let uploadUrl = '';
      const region = 'ap-northeast-2';
      const bucket = 'brain-vitamin-user-files';
      const s3Client = new S3Client({
        region, // AWS 리전을 설정하세요
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        },
        requestHandler: new FetchHttpHandler({ keepAlive: false }),
      });
      const path = `screeningTestAudios/${generateUniqueNumber()}-${
        sound.lastModified
      }`;
      const uploadParams = {
        Bucket: bucket,
        Key: path,
        Body: sound,
        ContentType: 'audio/mpeg',
      };
      const uploadAudioFileToS3 = async () => {
        try {
          const command = new PutObjectCommand(uploadParams);
          await s3Client.send(command);
          uploadUrl = `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
          console.log('uploadUrl', uploadUrl);
          resolve(uploadUrl);
        } catch (error) {
          console.error(error);
        }
      };
      uploadAudioFileToS3();
    });
  }, []);

  const handleEachProblemAnswerSubmit = (uploadUrl: string | null) => {
    return new Promise((resolve) => {
      const submitAnswer = async () => {
        try {
          const { data } = await axios.post(
            `${
              import.meta.env.VITE_API_URL
            }/patient/vitamins/screening-test/detail`,
            {
              count: 1,
              firstVertex,
              secondVertex,
              audioFileUrl: uploadUrl,
              screeningTestId: questions[currentIndex].screeningTestId,
            },
            {
              headers: {
                authorization: `Bearer ${accessToken}`,
              },
            },
          );
          if (data.result.stop) {
            setTotalScore((prev) => prev + data.result);
          } else {
            // 추가 질문 추가
            // const newQuestions = questions;
            // const additionalQuestion = {
            //   ...newQuestions[currentIndex],
            //   audioUrl: '',
            //   description: data.result.description,
            // };
            // newQuestions.splice(currentIndex + 1, 0, additionalQuestion);
            // setQuestions(newQuestions);
            // console.log(newQuestions, currentIndex);
          }
          resolve(true);
        } catch (error) {
          console.error(error);
        }
      };
      submitAnswer();
    });
  };

  const handleStep6789Submit = async () => {
    if (questions[currentIndex].step === 6) {
      await handleEachProblemAnswerSubmit(null);
    }
    if (
      questions[currentIndex].step === 7 &&
      clickedTarget7.current === '/assets/images/step7-2.png'
    ) {
      setTotalScore((prev) => prev + 1);
    }
  };

  const handleNextStep = async () => {
    // 0. 이전 오디오 멈춤
    if (currentAudio) {
      currentAudio.pause();
    }

    // 1. 답안 제출
    if (questions[currentIndex].mikeOn) {
      // 1-1. 음성 제출인 경우
      try {
        // 1-1-1. 녹음 중지
        const audioFileUrl = await offRecAudio();
        // 1-1-2. 파일 저장
        const uploadUrl = await onSubmitAudioFile(audioFileUrl as Blob);
        // 1-1-3. 현재 문제에 대한 오디오 파일 제출 -> 총 점수 갱신 or 추가 질문
        await handleEachProblemAnswerSubmit(uploadUrl as string);
      } catch (error) {
        console.error(error);
      }
    }
    // 1-2. 음성 제출이 아닌 경우
    handleStep6789Submit();

    // 2. 다음 질문 음성 파일 재생
    const nextAudioUrl = questions[currentIndex + 1].audioUrl;
    const audio = new Audio(nextAudioUrl);
    setCurrentAudio(null);
    if (nextAudioUrl) {
      audio.play();
      setCurrentAudio(audio);
    }

    // 3. 다음 문제가 mike on일 경우 녹음 시작
    if (questions[currentIndex + 1].mikeOn) {
      // 질문이 끝난 후 녹음 시작
      if (nextAudioUrl) {
        audio.addEventListener('loadedmetadata', (e) => {
          if (e.target) {
            const duration = (e.target as HTMLAudioElement).duration;
            setTimeout(() => onRecAudio(), duration * 1000);
          }
        });
      } else {
        onRecAudio();
      }
    }

    // 4. 다시 듣기 횟수 갱신
    setTrialCount(questions[currentIndex + 1].trial ?? 10);

    // 5. 현재 스텝 갱신
    if (currentStep !== questions[currentIndex + 1].step) {
      setCurrentStep((prev) => prev + 1);
    }

    // 6. 현재 문제 인덱스 갱신
    setCurrentIndex((prev) => prev + 1);
  };

  const onSubmit = async () => {
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
    const nextAudioUrl = questions[currentIndex].audioUrl;
    const audio = new Audio(nextAudioUrl);
    if (nextAudioUrl) {
      audio.play();
    }

    setTrialCount((prev) => prev - 1);
  };

  const initButtonStyle = (el: HTMLElement) => {
    el.style.backgroundColor = 'var(--button-bg-color)';
    el.style.border = '0.2rem solid var(--black-color)';
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

  return (
    <Container>
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
                {questions[currentIndex].hide ||
                (questions[currentIndex].step >= 6 &&
                  questions[currentIndex].step <= 9)
                  ? null
                  : convertNewlineToJSX(questions[currentIndex].description)}
              </Question>
              <ListenAgainButton
                disabled={!trialCount}
                onClick={handleListenAgain}>
                다시 듣기
              </ListenAgainButton>
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
            </QuestionWrapper>
          ) : null}
        </Box>
        <ButtonWrapper>
          {currentStep > stepCnt ? (
            <Button onClick={onSubmit}>검사 종료</Button>
          ) : (
            <Button onClick={handleNextStep}>다음</Button>
          )}
        </ButtonWrapper>
      </Wrapper>
    </Container>
  );
}

const Wrapper = styled.div`
  @media screen and (max-width: 767px) {
    padding: 1.6rem;
  }
`;

const Box = styled.div`
  width: 146.3rem;
  height: 65rem;
  border-radius: 1.6rem;
  background: #fff;
  box-shadow: 1.5rem 1.3rem 2.8rem 0 rgba(0, 0, 0, 0.06);
  padding: 3rem;
  margin: 2.55rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 80rem;
    height: 33rem;
    margin: 2rem 0;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
    height: 52rem;
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
    width: 4rem;
    height: 4rem;
    font-size: 2rem;
    border: 0.2rem solid white;
  }
  @media screen and (max-width: 767px) {
    width: 1.1rem;
    height: 1.1rem;
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
    gap: 2rem;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    padding: 1rem 0;
  }
`;

const Question = styled.p`
  font-size: 4rem;
  word-break: keep-all;
  font-family: 'Pretendard-Medium';
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 2.2rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 1.6rem;
    margin: 0 0 1rem 0;
    text-align: center;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
`;
const ListenAgainButton = styled.button`
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
    font-size: 1.6rem;
    padding: 1.4rem 2rem;
  }
  @media screen and (max-width: 767px) {
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
`;
const Step6Image = styled.img`
  width: 600px;
  height: 600px;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 300px;
    height: 300px;
  }
  @media screen and (max-width: 767px) {
    width: 250px;
    height: 250px;
  }
`;
const Step7Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;
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

export default ScreeningTest;
