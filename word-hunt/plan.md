Possibly a fully automatic word hunt bot?

## Problems
Word Hunt is a game on Game Pigeon.  
Game Pigeon is only available on iOS devices.  
iOS devices are locked down pretty hard without jailbreaking.  
## A possible solution:  
1) Screen mirror to a laptop.
2) Using python, scan the Word Hunt game letters, then generate all possible paths for words.
3) Connect back to the phone with Across Center, allowing control of a cursor on the phone.
4) Move the cursor again using python, get max scores.  

Seems simple enough, right?
## Problems (again)
Step 2: Scanning through a dictionary is very slow, especially to check for all 8<sup>15</sup>-ish-ish words  
Step 3: Normal mouse inputs don't work, as Across Center seems to use raw inputs.
## Solutions (again)
Step 2: Precompute a trie before entering the game. Progress through the trie while DFSing the board, pruning any paths which cannot ever result in an actual word.  
Step 3: `ctypes.windll.user32.mouse_event` seems to work (extremely random since other raw methods like `win32api` and `ctypes.windll.user32.SetCursorPos` don't).

Hopefully this works...
