import { useMemo, useRef, useState } from 'react';
import {
  Container,
  PaperWrapper,
  Paper,
  CellWrapper,
  Cell,
  PaletteWrapper,
  Palette,
} from '../../components/games/Coloring';
import { GameProps } from '../../routes/gameRouter.tsx';

/**
 * 난도별 색칠해야 할 칸의 개수 상이
 * 하 : 8
 * 중 : 13
 * 상 : 18
 */
export default function Coloring({ gameData, onGameEnd }: GameProps) {
  const [nowColor, setNowColor] = useState('');
  const cellRefs = useRef<null[] | HTMLDivElement[]>([]);
  let difficulty = gameData.difficulty;
  let totalCellCnt = 18;
  let cellCnt;

  switch (difficulty) {
    case 1:
      cellCnt = 8;
      break;
    case 2:
      cellCnt = 13;
      break;
    case 3:
      cellCnt = 18;
  }

  const COLOR = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white'];
  let colors: string[] = [];
  if (cellCnt) {
    for (let i = 0; i < cellCnt; i++) {
      let randomIndex = Math.floor(Math.random() * (COLOR.length - 1));
      colors.push(COLOR[randomIndex]);
    }
    for (let i = 0; i < totalCellCnt - cellCnt; i++) {
      colors.push('white');
    }
  }
  const answer = useMemo(() => colors.sort(() => 0.5 - Math.random()), []);

  // 흰색인 것은 초기에 색칠되어 있도록 함
  answer.forEach((color, i) => {
    if (color === 'white') {
      cellRefs.current[i]?.setAttribute('color', 'white');
    }
  });

  const checkAnswer = () => {
    for (let i = 0; i < cellRefs.current.length; i++) {
      let el = cellRefs.current[i];
      if (el?.getAttribute('color') !== answer[i]) return;
    }
    onGameEnd();
  };

  const changeCellColor = (el: HTMLElement) => {
    el.setAttribute('color', nowColor);
    el.style.background = nowColor;
    checkAnswer();
  };

  return (
    <Container>
      <PaletteWrapper>
        {COLOR.map((color, index) => (
          <Palette
            key={index}
            color={color}
            onClick={() => setNowColor(color)}
          />
        ))}
      </PaletteWrapper>
      <PaperWrapper>
        <Paper>
          {answer.map((color, index) => (
            <CellWrapper key={index}>
              <Cell color={color} />
            </CellWrapper>
          ))}
        </Paper>
        <Paper>
          {answer.map((_, index) => (
            <CellWrapper key={index}>
              <Cell
                onClick={(e) => changeCellColor(e.target as HTMLElement)}
                ref={(el) => (cellRefs.current[index] = el)}
              />
            </CellWrapper>
          ))}
        </Paper>
      </PaperWrapper>
    </Container>
  );
}
