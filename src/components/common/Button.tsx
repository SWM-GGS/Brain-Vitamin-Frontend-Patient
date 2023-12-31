import { styled } from 'styled-components';
import { FadeLoader } from '@salmonco/react-loader-spinner';

type Props = {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  loading?: boolean;
};
function Button({ text, onClick, disabled, style, loading }: Readonly<Props>) {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      style={{
        ...style,
      }}>
      {loading ? (
        <FadeLoader color="white" width={3} height={10} margin={8} />
      ) : (
        text
      )}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 35.8rem;
  height: 5.2rem;
  background: var(--main-color);
  border-radius: 1.1rem;
  font-family: 'Pretendard-Bold';
  font-size: 1.6rem;
  color: white;
  padding: 1rem;
  @media screen and (min-width: 768px) and (max-height: 1079px) {
    width: 25rem;
    height: 4rem;
  }
  @media screen and (max-width: 767px) {
    width: 100%;
    height: 50px;
    font-size: 1.4rem;
  }
  &:disabled {
    background: #c6c6c6;
  }
`;

export default Button;
