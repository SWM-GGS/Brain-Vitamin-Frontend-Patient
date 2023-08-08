import { styled } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`;

const PaperWrapper = styled.div`
  @media screen and (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 2rem;
  }
`;

const Paper = styled.div`
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(6, 1fr);
  border-top: 0.2rem solid #aaa;
  border-left: 0.2rem solid #aaa;
  margin: 0 0 2rem 0;
`;

const CellWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
`;

const Cell = styled.div<{ color?: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: ${(props) => props.color};
  border-right: 0.2rem solid #aaa;
  border-bottom: 0.2rem solid #aaa;
`;

const PaletteWrapper = styled.div`
  text-align: center;
  margin: 0 0 4rem 0;
  @media screen and (max-width: 768px) {
    margin: 0 0 2rem 0;
  }
`;

const Palette = styled.button<{ color: string }>`
  border: 0.2rem solid #aaa;
  border-radius: 50%;
  background: ${(props) => props.color};
  margin: 1rem;
  padding: 2.8rem;
  @media screen and (max-width: 768px) {
    padding: 1.5rem;
    margin: 0.2rem;
  }
`;

export {
  Container,
  PaperWrapper,
  Paper,
  CellWrapper,
  Cell,
  PaletteWrapper,
  Palette,
};
