# Game Pigeon Bots
## Word Hunt - [Demo Video](https://youtu.be/rOtLNpUU4B8)
Current Record - **240600**
### Usage
*Specific screen locations have been programmed for the iPhone 12 Pro, and may have to be changed if you want to use it for any other phone.*
1) Download and install [Across Center](http://www.acrosscenter.com/)
2) Connect your phone to your computer on Across Center (follow the manual [here](http://www.acrosscenter.com/manual/))
3) Download `words.txt` and `word-hunt.py`, then run `word-hunt.py`
4) Open a Word Hunt game on the phone
5) Start the game, then enter in the letters into the program top to bottom, then left to right
6) Switch over to the phone in Across Center
7) Words will be drawn from longest to shortest, for around 70 seconds

### How It Works
1) A list of words (Scrabble's valid word list) is used to construct a trie, which is used to only follow valid words as a DFS runs through all possible word combinations.
2) Raw mouse data is sent to Across Center, which forwards it to the iPhone cursor.

## Anagrams
### Usage
*Specific screen locations have been programmed for the iPhone 12 Pro, and may have to be changed if you want to use it for any other phone.*
1) Download and install [Across Center](http://www.acrosscenter.com/)
2) Connect your phone to your computer on Across Center (follow the manual [here](http://www.acrosscenter.com/manual/))
3) Download `words.txt` and `anagrams.py`, then run `anagrams.py`
4) Open an Anagrams game on the phone
5) Start the game, then enter in the letters into the program left to right
6) Switch over to the phone in Across Center
7) Words will be formed from longest to shortest, for around 60 seconds

### How It Works
1) A list of words (Scrabble's valid word list) is searched for possible anagrams
2) Raw mouse data is sent to Across Center, which forwards it to the iPhone cursor

## Word Bites
Somewhat impractical, just randomly placing blocks could result in higher points
*Specific screen locations have been programmed for the iPhone 12 Pro, and may have to be changed if you want to use it for any other phone.*
### How It (Kinda) Works
1) The TeamViewer screenshare is scanned for all the tiles, and the user manually enters in the letters.
2) A list of words (Scrabble's valid word list) is used to construct a trie, which is used to only follow valid words as a DFS runs through all possible word combinations.
3) All tiles are moved to their own 2x2 squares in the top 6 rows.
4) For each word, each tile is moved to the bottom 3 rows, forming the word. The tiles are then moved back to empty 2x2s.
### Potential Optimizations
- Do not move tiles back and forth if they are used in next word
- Create word order such that the minimum number of letters at the end are changed, like DFSing through a tree

## Basketball
*Specific screen locations have been programmed for the iPhone 12 Pro, and may have to be changed if you want to use it for any other phone.*
### How It Works
1) The TeamViewer screenshare is scanned for the placed basketball
2) The cursor is moved to the ball and drags it towards the basket

## Mancala
Mancala - Avalanche Mode
### Usage
1) Download and run `mancala.py`
2) Enter the number of stones in each hole from top left to bottom left, then bottom right to top right, seperated by newlines. Do not enter the number of stones in each store.
3) Pick a path to follow. From left to right, click on the corresponding hole (0 is the top hole, 5 is the bottom hole)
### How It Works
1) Every possible path of pieces is simulated, and the best one is picked out.
### Notes
From this, the optimal path for a normal Avalanche game is as follows:  
`5, 2, 1, 4, 0, 0, 4, 4, 5, 0, 2, 3, 5, 1, 5, 5, 4, 1, 5, 0, 5, 2, 5, 4, 5, 3`  
This gets a total of 43 stones.
