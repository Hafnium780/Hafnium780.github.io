import ctypes
import time


def char_to_ind(c):
    return ord(c) - ord('A')

# Mouse movement


def moveMouse(dx, dy):
    ctypes.windll.user32.mouse_event(1, dx, dy, 0, 0)
    time.sleep(0.02)


def mouseDown():
    ctypes.windll.user32.mouse_event(2, 0, 0, 0, 0)
    time.sleep(0.02)


def mouseUp():
    ctypes.windll.user32.mouse_event(4, 0, 0, 0, 0)
    time.sleep(0.01)


def homeCursor():
    for _ in range(5):
        moveMouse(0, -100)
    for _ in range(5):
        moveMouse(-100, 0)


letters = [0 for _ in range(26)]
board_height = 4

print("input letters:\n")
manual_board = input().upper()
board = manual_board
for c in manual_board:
    letters[char_to_ind(c)] = letters[char_to_ind(c)] + 1

wordlist = open("words.txt", "r")
possible_words = []
for word in wordlist:
    word = word[:-1]
    if len(word) <= 2 or len(word) > len(board):
        continue
    word_letters = [0 for _ in range(26)]
    for c in word:
        ind = char_to_ind(c)
        word_letters[ind] = word_letters[ind] + 1

    works = True
    for i in range(26):
        if word_letters[i] > letters[i]:
            works = False
            break
    if works:
        possible_words.append(word)

possible_words.sort(key=lambda w: len(w))
possible_words.reverse()

time.sleep(4)


def gotoCell(cx, cy, x, y):
    while cx < x:
        moveMouse(43, 0)
        cx = cx+1
    while cx > x:
        moveMouse(-43, 0)
        cx = cx-1
    while cy < y:
        moveMouse(0, 43)
        cy = cy+1
    while cy > y:
        moveMouse(0, -43)
        cy = cy-1


ccx = 0
ccy = 0


def typeWord(word):
    global ccx
    global ccy
    board_used = [False for _ in range(len(board))]
    for char in word:
        for i in range(len(board)):
            if char == board[i] and not board_used[i]:
                gotoCell(ccx, ccy, i, 0)
                mouseDown()
                mouseUp()
                ccx = i
                ccy = 0
                board_used[i] = True
                break

    enter()


def enter():
    global ccx
    global ccy
    gotoCell(ccx, ccy, 2, -3)
    time.sleep(0.05)
    mouseDown()
    time.sleep(0.1)
    mouseUp()
    ccx = 2
    ccy = -3


homeCursor()
for _ in range(4):
    moveMouse(0, 100)
moveMouse(28, 8)

initial_time = time.time()
print("Following Paths...")
for word in possible_words:
    print(word)
    typeWord(word)
    if time.time() - initial_time > 60:
        break
print("Done!")
