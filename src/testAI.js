import AIService from './services/aiService';

const testAI = async () => {
  console.log('🤖 Testing AI Move Generation...');
  
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const aiService = new AIService(apiKey);
  
  // Test board - initial position
  const board = [
    ['rb', 'nb', 'bb', 'qb', 'kb', 'bb', 'nb', 'rb'],
    ['pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw', 'Pw'],
    ['Rw', 'Nw', 'Bw', 'Qw', 'Kw', 'Bw', 'Nw', 'Rw']
  ];
  
  console.log('Testing AI move for black pieces...');
  
  try {
    const aiMove = await aiService.getAIMove(board, 'b', 'medium');
    
    if (aiMove) {
      console.log('✅ AI move generated successfully:', aiMove);
      console.log(`From: (${aiMove.fromRow}, ${aiMove.fromCol})`);
      console.log(`To: (${aiMove.toRow}, ${aiMove.toCol})`);
      
      // Test if the move is valid
      const piece = board[aiMove.fromRow][aiMove.fromCol];
      console.log(`Piece: ${piece}`);
      
      if (piece && piece[1] === 'b') {
        console.log('✅ Move is valid - piece belongs to AI color');
      } else {
        console.log('❌ Move is invalid - piece does not belong to AI');
      }
    } else {
      console.log('❌ No AI move generated');
    }
  } catch (error) {
    console.error('❌ Error generating AI move:', error);
  }
  
  console.log('\n🎉 AI test completed!');
};

export default testAI; 