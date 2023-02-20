# Word Hunt Bot
## Usage
*Specific screen locations have been programmed for the iPhone 12 Pro, and may have to be changed if you want to use it for any other phone.*
1) Download and install [Across Center](http://www.acrosscenter.com/)
2) Connect your phone to your computer on Across Center (follow the manual [here](http://www.acrosscenter.com/manual/))
3) Download and run main.py
4) Open a Word Hunt game on the phone
5) Start the game, then enter in the letters into the program top to bottom, then left to right
6) Switch over to the phone in Across Center
7) Words will be drawn from longest to shortest, for around 70 seconds

## How It Works
1) A list of words is used to construct a trie, which is used to only follow valid words as a DFS runs through all possible word combinations.
2) Raw mouse data is sent to Across Center, which forwards it to the iPhone cursor.
