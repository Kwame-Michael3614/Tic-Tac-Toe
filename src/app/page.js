"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import Square from "./square.jsx"; 
import Image from "next/image";

const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export default function Home() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.MEDIUM);
  const [scores, setScores] = useState({ human: 0, ai: 0, draws: 0 });
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Memoized game state calculations
  const gameState = useMemo(() => {
    const winner = calculateWinner(squares);
    const winningLine = winner ? getWinningLine(squares) : null;
    const isDraw = !winner && squares.every(square => square !== null);
    const isGameOver = winner || isDraw;
    const currentPlayer = isXNext ? 'X' : 'O';
    
    return {
      winner,
      winningLine,
      isDraw,
      isGameOver,
      currentPlayer
    };
  }, [squares, isXNext]);

  // AI Move Logic with different difficulty levels
  const makeAIMove = useCallback((boardState, player, difficultyLevel) => {
    const availableMoves = boardState
      .map((square, index) => square === null ? index : null)
      .filter(val => val !== null);

    if (availableMoves.length === 0) return null;

    switch (difficultyLevel) {
      case DIFFICULTY_LEVELS.EASY:
        // Random move
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      
      case DIFFICULTY_LEVELS.MEDIUM:
        // 70% optimal, 30% random
        if (Math.random() < 0.7) {
          return minimax(boardState, player, true).index;
        }
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      
      case DIFFICULTY_LEVELS.HARD:
      default:
        // Always optimal
        return minimax(boardState, player, true).index;
    }
  }, [minimax]);

  // Minimax algorithm for optimal AI play
  const minimax = useCallback((board, player, isMaximizing, depth = 0) => {
    const winner = calculateWinner(board);
    
    if (winner === player) return { score: 10 - depth };
    if (winner === (player === 'X' ? 'O' : 'X')) return { score: depth - 10 };
    if (board.every(square => square !== null)) return { score: 0 };

    const moves = [];
    const currentPlayer = isMaximizing ? player : (player === 'X' ? 'O' : 'X');

    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = currentPlayer;
        
        const result = minimax(newBoard, player, !isMaximizing, depth + 1);
        moves.push({ index: i, score: result.score });
      }
    }

    if (isMaximizing) {
      return moves.reduce((best, move) => move.score > best.score ? move : best);
    } else {
      return moves.reduce((best, move) => move.score < best.score ? move : best);
    }
  }, []);

  // Handle square click
  const handleSquareClick = useCallback((index) => {
    if (gameState.isGameOver || squares[index] || isAIThinking) return;
    
    const newSquares = [...squares];
    newSquares[index] = gameState.currentPlayer;
    
    setSquares(newSquares);
    setIsXNext(!isXNext);
  }, [squares, gameState, isXNext, isAIThinking]);

  // AI move effect - AI plays as O when enabled
  useEffect(() => {
    if (gameState.isGameOver || !isAIEnabled || gameState.currentPlayer !== 'O') return;

    setIsAIThinking(true);
    const timer = setTimeout(() => {
      const aiMove = makeAIMove(squares, 'O', difficulty);
      if (aiMove !== null) {
        const newSquares = [...squares];
        newSquares[aiMove] = 'O';
        setSquares(newSquares);
        setIsXNext(true);
      }
      setIsAIThinking(false);
    }, 800); // Simulate thinking time

    return () => clearTimeout(timer);
  }, [squares, gameState, isAIEnabled, difficulty, makeAIMove]);

  // Update scores when game ends
  useEffect(() => {
    if (gameState.winner) {
      setScores(prev => {
        if (isAIEnabled) {
          const humanWon = gameState.winner === 'X';
          return {
            ...prev,
            human: humanWon ? prev.human + 1 : prev.human,
            ai: humanWon ? prev.ai : prev.ai + 1
          };
        } else {
          // Human vs Human mode - just track X and O
          return {
            ...prev,
            human: gameState.winner === 'X' ? prev.human + 1 : prev.human,
            ai: gameState.winner === 'O' ? prev.ai + 1 : prev.ai
          };
        }
      });
    } else if (gameState.isDraw) {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  }, [gameState.winner, gameState.isDraw, isAIEnabled]);

  const resetGame = useCallback(() => {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setIsAIThinking(false);
  }, []);

  const resetScores = useCallback(() => {
    setScores({ human: 0, ai: 0, draws: 0 });
  }, []);

  const toggleAI = useCallback(() => {
    setIsAIEnabled(!isAIEnabled);
    resetGame();
  }, [isAIEnabled, resetGame]);

  const getStatusMessage = () => {
    if (isAIThinking) return "🤖 AI is thinking...";
    if (gameState.winner) {
      if (isAIEnabled) {
        return gameState.winner === 'X' ? "🎉 You win!" : "🤖 AI wins!";
      } else {
        return `🎉 Player ${gameState.winner} wins!`;
      }
    }
    if (gameState.isDraw) return "🤝 It's a draw!";
    
    if (isAIEnabled) {
      return gameState.currentPlayer === 'X' ? "Your turn (X)" : "AI's turn (O)";
    } else {
      return `Player ${gameState.currentPlayer}'s turn`;
    }
  };

  const getPlayerLabel = (player) => {
    if (!isAIEnabled) return `Player ${player}`;
    return player === 'X' ? '👤 You' : '🤖 AI';
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>🎯 Tic-Tac-Toe</h1>
        <div className="status-message">{getStatusMessage()}</div>
      </header>

      <div className="game-controls">
        <div className="mode-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isAIEnabled}
              onChange={toggleAI}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              {isAIEnabled ? '👥 Human vs 🤖AI Mode' : '👥 Human vs 👥 Human'}
            </span>
          </label>
        </div>

        {isAIEnabled && (
          <div className="difficulty-selector">
            <label>AI Difficulty:</label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value={DIFFICULTY_LEVELS.EASY}>😴 Easy</option>
              <option value={DIFFICULTY_LEVELS.MEDIUM}>😐 Medium</option>
              <option value={DIFFICULTY_LEVELS.HARD}>😈 Hard</option>
            </select>
          </div>
        )}

        <div className="control-buttons">
          <button onClick={resetGame} className="btn btn-primary">
            New Game
          </button>
          <button onClick={resetScores} className="btn btn-secondary">
            Reset Scores
          </button>
        </div>
      </div>

      <div className="scores-display">
        <div className="score-item">
          <span className="score-label">{getPlayerLabel('X')}</span>
          <span className="score-value">{isAIEnabled ? scores.human : scores.human}</span>
        </div>
        <div className="score-item">
          <span className="score-label">Draws</span>
          <span className="score-value">{scores.draws}</span>
        </div>
        <div className="score-item">
          <span className="score-label">{getPlayerLabel('O')}</span>
          <span className="score-value">{isAIEnabled ? scores.ai : scores.ai}</span>
        </div>
      </div>

      <main className="game-board-container">
        <div className="board">
          {squares.map((square, index) => (
            <Square
              key={`square-${index}`}
              value={square}
              onClick={() => handleSquareClick(index)}
              isWinning={gameState.winningLine?.includes(index)}
              disabled={isAIThinking}
              data-testid={`square-${index}`}
            />
          ))}
        </div>
        
        {isAIEnabled && (
          <div className="player-indicators">
            <div className={`player-indicator ${gameState.currentPlayer === 'X' ? 'active' : ''}`}>
              <span className="player-symbol">X</span>
              <span className="player-name">👤 You</span>
            </div>
            <div className={`player-indicator ${gameState.currentPlayer === 'O' ? 'active' : ''}`}>
              <span className="player-symbol">O</span>
              <span className="player-name">🤖 AI</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper functions
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function getWinningLine(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return line;
    }
  }
  return null;
}