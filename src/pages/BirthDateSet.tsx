import { useLocation, useNavigate } from 'react-router';
import { styled } from 'styled-components';
import Label from '../components/common/Label';
import { useState } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import LayerPopup from '../components/common/LayerPopup';
import { useModal } from '../hooks/useModal';
import { WidthContainer } from '../components/common/Container';

function BirthDateSet() {
  const { state } = useLocation();
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const navigate = useNavigate();
  const { isModalOpen, modalText, openModal, closeModal } = useModal();

  const onChangeBirthDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value.trim());
  };

  const goNext = () => {
    const birthDateRegex = /^\d{4}\d{2}\d{2}$/;
    if (!birthDateRegex.test(birthDate)) {
      openModal('생년월일을 올바르게 입력해주세요.');
      return;
    }
    navigate('/educationSet', {
      state: { birthDate, gender, nextToDo: state.nextToDo },
    });
  };

  return (
    <WidthContainer>
      <Header label="회원정보" />
      <Box>
        <Wrapper>
          <Label style={{ textAlign: 'center' }}>회원 정보 입력</Label>
          <Intro>생년월일(8자리) 입력해주세요</Intro>
          <Input
            label="생년월일"
            desc="19990101"
            value={birthDate}
            callbackFn={onChangeBirthDate}
          />
          <GenderWrapper>
            <GenderButton
              style={{
                background:
                  gender === 'MALE' ? 'var(--main-bg-color)' : 'white',
                border:
                  gender === 'MALE'
                    ? '0.2rem solid var(--main-color)'
                    : '0.2rem solid #E8E8E8',
                color: gender === 'MALE' ? 'var(--main-color)' : '#433D3A',
              }}
              onClick={() => setGender('MALE')}>
              남성
            </GenderButton>
            <GenderButton
              style={{
                background:
                  gender === 'FEMALE' ? 'var(--main-bg-color)' : 'white',
                border:
                  gender === 'FEMALE'
                    ? '0.2rem solid var(--main-color)'
                    : '0.2rem solid #E8E8E8',
                color: gender === 'FEMALE' ? 'var(--main-color)' : '#433D3A',
              }}
              onClick={() => setGender('FEMALE')}>
              여성
            </GenderButton>
          </GenderWrapper>
        </Wrapper>
        <Button text="다음" disabled={!birthDate || !gender} onClick={goNext} />
      </Box>
      {isModalOpen && (
        <LayerPopup
          label={modalText}
          centerButtonText="확인"
          onClickCenterButton={closeModal}
        />
      )}
    </WidthContainer>
  );
}

const Box = styled.div`
  width: 86.8rem;
  height: 71.9rem;
  border-radius: 16px;
  background: #fff;
  box-shadow: 15px 13px 28px 0px rgba(0, 0, 0, 0.06);
  padding: 7.2rem 0 4.6rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 750px;
    height: 550px;
    padding: 2rem;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
    height: 500px;
    padding: 1.6rem;
  }
`;

const Wrapper = styled.div`
  @media screen and (max-width: 767px) {
    width: 100%;
  }
`;

const Intro = styled.p`
  font-family: 'Pretendard-Medium';
  font-size: 2.2rem;
  margin: 8.2rem 0 2.4rem 0;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    margin: 4.1rem 0 1rem 0;
  }
  @media screen and (max-width: 767px) {
    font-size: 1.8rem;
    margin: 4.1rem 0 1rem 0;
  }
`;

const GenderWrapper = styled.div`
  display: flex;
  width: 41.2rem;
  justify-content: space-between;
  gap: 0.8rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 30rem;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
  }
`;

const GenderButton = styled.button`
  padding: 1.6rem 4.6rem;
  border-radius: 0.8rem;
  font-size: 2rem;
  width: 100%;
  margin: 2.5rem 0 0 0;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 1.8rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 1.4rem;
    padding: 1.6rem;
  }
`;

export default BirthDateSet;
