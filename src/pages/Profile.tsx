import { styled } from 'styled-components';
import Label from '../components/common/Label';
import { useState } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import axios, { AxiosError } from 'axios';
import LeftTapBar from '../components/common/LeftTabBar';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducer';
import { useAppDispatch } from '../store';
import userSlice from '../slices/user';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import LayerPopup from '../components/common/LayerPopup';
import { useModal } from '../hooks/useModal';
import { SideContainer } from '../components/common/Container';
import { generateUniqueNumber } from '../modules/generateUniqueNumber';
import { getErrorMessage } from '../utils/getErrorMessage';
import Header from '../components/common/Header';

function Profile() {
  const { nickname, familyKey, accessToken, profileImgUrl, education } =
    useSelector((state: RootState) => state.user);
  const [profileImg, setProfileImg] = useState<File>();
  const [profileImgPreviewUrl, setProfileImgPreviewUrl] = useState('');
  const [newNickname, setNewNickname] = useState(nickname);
  const [newEducation, setNewEducation] = useState(education);
  const dispatch = useAppDispatch();
  const { isModalOpen, modalText, openModal, closeModal } = useModal();
  const [submitLoading, setSubmitLoading] = useState(false);

  const onChangeProfileImgUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageArr = e.target.files;
    const maxImageLength = 1;
    if (!imageArr?.length) return;
    if (imageArr.length > maxImageLength) {
      openModal('최대 등록 가능한 이미지 개수를 초과했습니다.');
      return;
    }
    const image = imageArr[0];
    if (
      image.type !== 'image/jpeg' &&
      image.type !== 'image/jpg' &&
      image.type !== 'image/png'
    ) {
      openModal('JPG 혹은 PNG 확장자의 이미지 파일만 등록 가능합니다.');
      return;
    }
    setProfileImg(image);
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfileImgPreviewUrl(reader.result);
      }
    };
  };

  const onChangeNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewNickname(e.target.value.trim());
  };

  const handleEdu = (edu: string) => {
    setNewEducation(edu);
  };

  const handleSave = async () => {
    setSubmitLoading(true);
    let uploadUrl = profileImgUrl;
    if (profileImg) {
      const region = 'ap-northeast-2';
      const bucket = 'brain-vitamin-user-files';
      const s3Client = new S3Client({
        region, // AWS 리전을 설정하세요
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        },
      });
      const path = `profile/${generateUniqueNumber()}-${profileImg.name}`;
      const uploadParams = {
        Bucket: bucket,
        Key: path,
        Body: profileImg,
      };
      try {
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);
        uploadUrl = `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
      } catch (error) {
        console.error(error);
      }
    }
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/patient/profiles`,
        {
          profileImgUrl: uploadUrl,
          nickname: newNickname,
          education: newEducation,
        },
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
      dispatch(userSlice.actions.setNickname(newNickname));
      dispatch(userSlice.actions.setEducation(newEducation));
      dispatch(userSlice.actions.setProfileImgUrl(uploadUrl));
      openModal(data.result, '/setting');
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError;
      const errorMessage = getErrorMessage(axiosError);
      openModal(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderProfileImage = () => {
    if (profileImgPreviewUrl) {
      return <ProfileImage alt="" src={profileImgPreviewUrl} />;
    }
    if (profileImgUrl) {
      return <ProfileImage alt="" src={profileImgUrl} />;
    } else {
      return <ProfileImage alt="" src="/assets/images/profile-default.svg" />;
    }
  };

  return (
    <Container>
      <LeftTapBar />
      <Header label="회원정보 변경" />
      <SideContainer>
        <Box>
          <Label style={{ textAlign: 'center' }}>회원정보 변경하기</Label>
          <Contents>
            <ProfileContainer>
              <input
                style={{ display: 'none' }}
                type="file"
                id="image"
                accept="image/jpg, image/jpeg, image/png"
                onChange={onChangeProfileImgUrl}
              />
              <ImageContainer>
                <label htmlFor="image">
                  {renderProfileImage()}
                  <ChangeImageText>사진 변경</ChangeImageText>
                </label>
              </ImageContainer>
              <Name>{nickname}</Name>
              <Sub>가족 고유번호 : {familyKey}</Sub>
            </ProfileContainer>
            <InfoContainer>
              <InputWrapper>
                <Section>
                  <Intro>별명을 입력해주세요</Intro>
                  <Input
                    label="별명"
                    desc="별명을 입력해주세요"
                    value={newNickname}
                    callbackFn={onChangeNickname}
                  />
                </Section>
                <Section>
                  <Intro>학력을 입력해주세요</Intro>
                  <EduSelect
                    value={newEducation}
                    onChange={(e) =>
                      handleEdu((e.target as HTMLSelectElement).value)
                    }>
                    <option value="무학">무학</option>
                    <option value="초졸">초졸</option>
                    <option value="중졸">중졸</option>
                    <option value="고졸">고졸</option>
                    <option value="대졸">대졸</option>
                  </EduSelect>
                </Section>
              </InputWrapper>
            </InfoContainer>
          </Contents>
          <Button
            text="저장"
            disabled={!newNickname || !newEducation}
            onClick={handleSave}
            loading={submitLoading}
          />
        </Box>
      </SideContainer>
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

const Container = styled.div`
  @media screen and (min-width: 768px) {
    display: flex;
    justify-content: space-between;
  }
`;
const Box = styled.div`
  width: 87rem;
  height: 68.3rem;
  border-radius: 1.6rem;
  background: #fff;
  box-shadow: 1.5rem 1.3rem 2.8rem 0 rgba(0, 0, 0, 0.06);
  padding: 5.2rem 6.9rem 3.7rem 11rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 750px;
    height: 500px;
    padding: 2rem;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
    height: 650px;
    padding: 2rem;
  }
`;
const Contents = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    gap: 4rem;
  }
  @media screen and (max-width: 767px) {
    flex-direction: column;
    gap: 1rem;
  }
`;
const EduSelect = styled.select`
  width: 100%;
  height: 5.7rem;
  border-radius: 8px;
  font-family: 'Pretendard-Medium';
  font-size: 2.2rem;
  text-align: center;
  appearance: none;
  background: url('/assets/images/arrow-select.svg') calc(100% - 15px) center
    no-repeat;
  border: 0.2rem solid #c6c6c6;
  &:focus {
    outline: none;
    border: 0.2rem solid var(--main-color);
  }
  @media screen and (max-width: 767px) {
    font-size: 1.6rem;
    height: 4rem;
  }
`;
const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3rem 0 0 0;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    margin: 2rem 0 0 0;
  }
  @media screen and (max-width: 767px) {
    margin: 2rem 0 0 0;
  }
`;
const Section = styled.div`
  width: 100%;
  margin: 0 0 2.9rem 0;
  @media screen and (max-width: 767px) {
    margin: 0 0 1.4rem 0;
  }
`;
const Intro = styled.p`
  font-family: 'Pretendard-Medium';
  font-size: 2.2rem;
  margin: 0 0 2.4rem 0;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 2.2rem;
    margin: 0 0 1rem 0;
  }
  @media screen and (max-width: 767px) {
    font-size: 1.8rem;
    margin: 0 0 1rem 0;
  }
`;
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 41.2rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 30rem;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
  }
`;
const ProfileImage = styled.img`
  display: block;
  object-fit: cover;
  width: 300px;
  height: 300px;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 200px;
    height: 200px;
  }
  @media screen and (max-width: 767px) {
    width: 125px;
    height: 125px;
  }
`;
const Name = styled.span`
  font-family: 'Pretendard-Bold';
  font-size: 2.6rem;
  color: #433d3a;
  margin: 2.9rem 0 1.3rem 0;
  @media screen and (max-width: 767px) {
    font-size: 2.2rem;
    margin: 1.5rem 0 1rem 0;
  }
`;
const Sub = styled.span`
  font-size: 1.6rem;
  color: #433d3a;
`;
const ImageContainer = styled.div`
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }
`;
const ChangeImageText = styled.span`
  font-family: 'Pretendard-Bold';
  font-size: 2.6rem;
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    font-size: 1.8rem;
  }
  @media screen and (max-width: 767px) {
    font-size: 1.3rem;
  }
`;

export default Profile;
