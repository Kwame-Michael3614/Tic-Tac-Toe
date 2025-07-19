import { memo } from 'react';

const Square = memo(({ 
  value, 
  onClick, 
  isWinning = false, 
  disabled = false,
  'data-testid': testId = 'square'
}) => {
  const handleClick = () => {
    if (!disabled && !value) {
      onClick();
    }
  };

  const getSquareClass = () => {
    let classes = 'square';
    if (isWinning) classes += ' winning';
    if (value) classes += ` player-${value.toLowerCase()}`;
    if (disabled) classes += ' disabled';
    return classes;
  };

  return (
    <button
      className={getSquareClass()}
      onClick={handleClick}
      disabled={disabled || !!value}
      data-testid={testId}
      aria-label={`Square ${value ? `filled with ${value}` : 'empty'}`}
    >
      <span className="square-content" aria-hidden="true">
        {value}
      </span>
    </button>
  );
});

Square.displayName = 'Square';

export default Square;