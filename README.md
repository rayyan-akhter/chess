# Chess Game with AI

A complete chess game built with React, featuring all standard chess rules and an AI opponent powered by Google's Gemini API.

## Features

### Complete Chess Rules Implementation
- ✅ **All piece movements** (King, Queen, Rook, Bishop, Knight, Pawn)
- ✅ **Castling** (Kingside and Queenside)
- ✅ **En Passant** capture
- ✅ **Pawn Promotion** (Queen, Rook, Bishop, Knight)
- ✅ **Check Detection**
- ✅ **Checkmate Detection**
- ✅ **Stalemate Detection**
- ✅ **Move Validation** (prevents moves that put own king in check)
- ✅ **Turn-based gameplay**

### AI Integration
- 🤖 **Gemini AI-powered opponent**
- 🎯 **Three difficulty levels**: Easy, Medium, Hard
- ⚡ **Smart move generation** with fallback to random moves
- 🔄 **Automatic AI turns**

### User Interface
- 🎨 **Modern, responsive design**
- 📱 **Mobile-friendly layout**
- 🎯 **Visual move highlighting**
- 📊 **Move history tracking**
- 🏆 **Captured pieces display**
- ⚙️ **Game controls and settings**
- 🔄 **Undo move functionality**
- 🆕 **New game option**

### Game Management
- 🎮 **Player vs Player mode**
- 🤖 **Player vs AI mode**
- 🎨 **Player color selection**
- 📈 **Real-time game state updates**
- 🏁 **Game end detection and display**

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Gemini API Key
To enable AI functionality, you need a Google Gemini API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Create a `.env` file in the project root:
```env
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

### 3. Start the Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

## How to Play

### Basic Gameplay
1. **Select a piece** by clicking on it
2. **Valid moves** will be highlighted in green
3. **Click on a highlighted square** to move
4. **Promote pawns** when they reach the opposite end
5. **Checkmate** your opponent to win!

### AI Mode
1. **Enable AI** in the game settings
2. **Choose your color** (White or Black)
3. **Select difficulty level** (Easy, Medium, Hard)
4. **Play against the AI** - it will automatically make moves

### Game Controls
- **New Game**: Start a fresh game
- **Undo Move**: Go back one move (if available)
- **Player Color**: Choose to play as White or Black
- **AI Toggle**: Enable/disable AI opponent
- **Difficulty**: Set AI difficulty level

## Technical Implementation

### Architecture
- **React** for UI components
- **Custom Chess Service** for game logic
- **Gemini AI API** for computer opponent
- **CSS Grid** for responsive board layout

### Key Components
- `Board.jsx`: Main game board and logic
- `ChessService.js`: Complete chess rules implementation
- `AIService.js`: AI move generation using Gemini
- `GameControls.jsx`: Game settings and controls
- `Cell.jsx`: Individual board squares

### Chess Rules Implementation
The chess service implements all standard chess rules:
- **Piece movement validation**
- **Check and checkmate detection**
- **Special moves** (castling, en passant)
- **Move history tracking**
- **Game state management**

## Missing Features (Now Implemented)

The original chess game was missing several critical features that have now been added:

1. **Castling** - King and Rook special move
2. **En Passant** - Pawn capture special move  
3. **Checkmate Detection** - Game ending condition
4. **Stalemate Detection** - Draw condition
5. **Move Validation** - Preventing moves that put own king in check
6. **Game State Management** - Turn tracking, game over states
7. **Move History** - Tracking all moves made
8. **AI Opponent** - Computer player using Gemini API
9. **UI Improvements** - Game status, controls, responsive design

## API Usage

The AI service uses the Gemini API to generate intelligent moves:
- Converts board position to FEN notation
- Sends position to Gemini with chess-specific prompts
- Parses AI response to extract valid moves
- Falls back to random moves if AI fails

## Contributing

Feel free to contribute improvements:
- Bug fixes
- New features
- UI/UX enhancements
- Performance optimizations

## License

This project is open source and available under the MIT License.
