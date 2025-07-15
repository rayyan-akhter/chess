# 🚀 Quick Start Guide

## **Immediate Setup (No API Key Required)**

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the game**:
   ```bash
   npm start
   ```

3. **Open your browser** to `http://localhost:3000`

4. **Start playing immediately** in demo mode! 🎮

## **Demo Mode Features**

✅ **All chess rules work perfectly**
✅ **AI opponent with smart moves**
✅ **Three difficulty levels**
✅ **Complete game functionality**
✅ **Beautiful UI and controls**

## **Enable Full AI (Optional)**

For enhanced AI using Gemini API:

1. Get free API key: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create `.env` file in project root:
   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```
3. Restart the server

## **How to Play**

1. **Select a piece** → Click on any piece
2. **See valid moves** → Green highlights appear
3. **Make a move** → Click on highlighted square
4. **Enable AI** → Use the game controls panel
5. **Choose difficulty** → Easy, Medium, or Hard

## **Game Controls**

- **New Game**: Fresh start
- **Undo Move**: Go back one move
- **AI Toggle**: Play against computer
- **Player Color**: Choose White or Black
- **Difficulty**: Set AI level

## **Special Moves**

- **Castling**: Move king 2 squares toward rook
- **En Passant**: Capture pawn that just moved 2 squares
- **Pawn Promotion**: Choose piece when pawn reaches end

## **Game States**

- **Check**: King is under attack
- **Checkmate**: No legal moves, game over
- **Stalemate**: No legal moves, draw

---

**🎉 Your chess game is ready to play!** 

No setup required - just start the server and enjoy! ♟️ 