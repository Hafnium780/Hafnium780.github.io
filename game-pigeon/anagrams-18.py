from pynput.mouse import Button, Controller
import subprocess
import ctypes
import time
import re

mouse = Controller()


def char_to_ind(c):
    return ord(c) - ord('A')

# Mouse movement


def moveMouse(dx, dy):
    mouse.move(dx, dy)
    time.sleep(0.02)


def mouseDown():
    mouse.press(Button.left)
    time.sleep(0.02)


def mouseUp():
    mouse.release(Button.left)
    time.sleep(0.02)


def moveTo(x, y):
    mouse.position = (x, y)
    time.sleep(0.02)


homeX = 1004
homeY = 710


def homeCursor():
    moveTo(homeX, homeY)


letters = [0 for _ in range(26)]
board_height = 4

print("input letters:\n")
manual_board = input().upper()
board = manual_board
for c in manual_board:
    letters[char_to_ind(c)] = letters[char_to_ind(c)] + 1

wordlist1 = open("words.txt", "r")
wordlist2 = open("english.txt", "r")

wordlist = []

for word in wordlist1:
    wordlist.append(word)
for word in wordlist2:
    wordlist.append(word)

possible_words = []

for word in wordlist:
    word = word[:-1].upper()
    word = re.sub(r'\W+', '', word)

    if len(word) <= 2 or len(word) > len(board):
        continue

    if word in possible_words:
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

cmd = 'osascript -e \'activate application "iPhone Mirroring"\''
subprocess.call(cmd, shell=True)

time.sleep(4)

strLen = 56
diagLen = 56


def gotoAdjCell(cx, cy, x, y):
    if x == cx and y == cy:
        return
    if x == cx:
        if cy > y:
            moveMouse(0, -strLen)
        else:
            moveMouse(0, strLen)
    elif y == cy:
        if cx > x:
            moveMouse(-strLen, 0)
        else:
            moveMouse(strLen, 0)
    else:
        if cx > x and cy > y:
            moveMouse(-diagLen, -diagLen)
        elif cx > x and cy < y:
            moveMouse(-diagLen, diagLen)
        elif cx < x and cy > y:
            moveMouse(diagLen, -diagLen)
        elif cx < x and cy < y:
            moveMouse(diagLen, diagLen)


def gotoCell(cx, cy, x, y):
    moveTo(homeX + x * strLen, homeY + y * strLen)
    # while cx < x:
    #     moveMouse(strLen, 0)
    #     cx = cx+1
    # while cx > x:
    #     moveMouse(-strLen, 0)
    #     cx = cx-1
    # while cy < y:
    #     moveMouse(0, strLen)
    #     cy = cy+1
    # while cy > y:
    #     moveMouse(0, -strLen)
    #     cy = cy-1


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
    # time.sleep(0.05)
    mouseDown()
    # time.sleep(0.05)
    mouseUp()
    ccx = 2
    ccy = -3


homeCursor()

initial_time = time.time()
print("following paths...")
for word in possible_words:
    print(word)
    typeWord(word)
    time.sleep(0.1)
    if time.time() - initial_time > 60:
        break
print("done!")
