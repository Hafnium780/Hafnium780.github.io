from pynput.mouse import Listener
import pyautogui
from pynput.mouse import Button, Controller
import subprocess
import time
import numpy
import cv2
from PIL import ImageGrab
import easyocr
from collections import deque


mouse = Controller()


def moveMouse(dx, dy):
    mouse.move(dx, dy)
    time.sleep(0.02)


def mouseDown():
    mouse.press(Button.left)
    time.sleep(0.02)


def mouseUp():
    mouse.release(Button.left)
    time.sleep(0.02)


def homeCursor():
    mouse.position = (1005, 403)
    time.sleep(0.02)


print("Constructing Trie...")


def char_to_ind(c):
    return ord(c) - ord('A')


class Node:
    def __init__(self):
        self.is_word = False
        self.children = [-1 for i in range(26)]


trie = [Node()]

wordlist = open("words.txt", "r")
for word in wordlist:
    index = 0
    for char in word:
        if ord(char) == 10:
            break
        if trie[index].children[char_to_ind(char)] == -1:
            trie[index].children[char_to_ind(char)] = len(trie)
            index = len(trie)
            trie.append(Node())
        else:
            index = trie[index].children[char_to_ind(char)]
    trie[index].is_word = True

# Type: 0 - single, 1 - horiz, 2 - vert


class Cell:
    def __init__(self, x, y, typ, chars):
        self.x = x
        self.y = y
        self.typ = typ
        self.chars = chars


def evalWord(w):
    l = len(w)
    if l < 3:
        return 0
    elif l == 3:
        return 100
    elif l == 4:
        return 400
    elif l == 5:
        return 800
    elif l == 6:
        return 1400
    elif l == 7:
        return 1800
    elif l == 8:
        return 2200
    else:
        return 2600


reader = easyocr.Reader(['en'])

# Look for occupied cells
print("Scanning Board...")
# time.sleep(1)
xstep = 37
ystep = 37
width = 30
height = 30
board_width = 8
board_height = 9
# board = [[" " for _ in range(board_width)] for _ in range(board_height)]
# board = [[".", ".", ".", "A", "L", ".", ".", "."],
#          [".", ".", ".", ".", ".", ".", ".", "D"],
#          [".", ".", ".", "C", ".", ".", ".", "E"],
#          ["O", ".", ".", ".", ".", "S", ".", "."],
#          ["R", ".", "P", ".", ".", ".", ".", "."],
#          [".", ".", ".", ".", "I", "N", ".", "M"],
#          [".", "H", ".", ".", ".", ".", ".", "."],
#          [".", ".", ".", ".", ".", ".", ".", "."],
#          ["K", ".", ".", "G", "E", ".", ".", "."]]
board = [["S", "I", ".", "P", ".", ".", "A", "."],
         [".", ".", ".", ".", ".", ".", "T", "."],
         [".", "R", ".", "A", ".", ".", ".", "."],
         [".", ".", ".", ".", ".", ".", ".", "."],
         [".", ".", ".", ".", "H", ".", "U", "."],
         ["L", ".", "I", ".", ".", ".", "T", "."],
         [".", ".", ".", ".", ".", ".", ".", "."],
         [".", "N", "G", ".", ".", "W", "E", "."],
         [".", ".", ".", ".", ".", ".", ".", "."]]


scan_board = True

cmd = 'osascript -e \'activate application "iPhone Mirroring"\''
subprocess.call(cmd, shell=True)

# while True:
#     print(mouse.position)
#     time.sleep(1)

if scan_board:
    j = 0
    for x in range(988, 988+board_width*xstep, xstep):
        i = 0
        # print("-")
        for y in range(387, 387+board_height*ystep, ystep):
            # boardImage = cv2.bitwise_not(cv2.cvtColor(numpy.array(ImageGrab.grab(
            #     bbox=(x, y, x+width, y+height))), cv2.COLOR_BGR2GRAY))

            boardImage = cv2.resize(cv2.bitwise_not(cv2.cvtColor(
                numpy.array(ImageGrab.grab(bbox=(x+1, y+1, x + width, y + height-1))), cv2.COLOR_BGR2GRAY)), (300, 300))
            thresh = cv2.threshold(boardImage, 150, 255,
                                   cv2.THRESH_BINARY_INV)[1]
            result = cv2.GaussianBlur(thresh, (5, 5), 0)
            # boardText = pytesseract.image_to_string(
            #     result, lang='eng', config='--psm 10 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            text = reader.recognize(result, detail=0)
            board[i][j] = text[0].upper()
            if board[i][j] == "0":
                board[i][j] = 'O'
            if board[i][j] == '|' or board[i][j] == ']' or board[i][j] == '[' or board[i][j] == '1':
                board[i][j] = 'I'
            if board[i][j] == '5':
                board[i][j] = 'S'
            if board[i][j] == '':
                board[i][j] = '.'

            # print(text)
            # cv2.imshow('frame', result)
            # cv2.waitKey(100)
            # cv2.destroyAllWindows()
            i = i+1
        j = j+1

    # print("Input Letters: ")
    # collapsed_board = input().upper()
    # ind = 0

    # for i in range(board_height):
    #     for j in range(board_width):
    #         if board[i][j] == "#":
    #             board[i][j] = collapsed_board[ind]
    #             ind = ind + 1
    #         print(board[i][j], end="")
    #     print("")

cells = []

for x in board:
    print(x)
# print(board)

for i in range(board_height):
    for j in range(board_width):
        if board[i][j] != ".":
            if i < board_height-1 and board[i+1][j] != ".":
                cells.append(Cell(j, i, 2, board[i][j] + board[i+1][j]))
                board[i+1][j] = "."
            elif j < board_width-1 and board[i][j+1] != ".":
                cells.append(Cell(j, i, 1, board[i][j] + board[i][j+1]))
                board[i][j+1] = "."
            else:
                cells.append(Cell(j, i, 0, board[i][j]))

for cell in cells:
    print(cell.x, cell.y, cell.typ, cell.chars)

used = [False for _ in cells]
found_words = []
word_set = {}


def dfs_horiz(index, cur_word, order):
    if len(cur_word) > board_width:
        return
    if trie[index].is_word and len(cur_word) > 2 and (not cur_word in word_set):
        print(cur_word)
        word_set[cur_word] = True
        found_words.append((order.copy(), cur_word))

    for i in range(len(cells)):
        if used[i]:
            continue
        if cells[i].typ == 0:
            if trie[index].children[char_to_ind(cells[i].chars)] == -1:
                continue
            used[i] = True
            order.append((i, -1))
            dfs_horiz(trie[index].children[char_to_ind(
                cells[i].chars)], cur_word + cells[i].chars, order)
            order.pop()
            used[i] = False
        elif cells[i].typ == 2:
            if trie[index].children[char_to_ind(cells[i].chars[0])] != -1:
                used[i] = True
                order.append((i, 0))
                dfs_horiz(trie[index].children[char_to_ind(
                    cells[i].chars[0])], cur_word + cells[i].chars[0], order)
                order.pop()
                used[i] = False
            if trie[index].children[char_to_ind(cells[i].chars[1])] != -1:
                used[i] = True
                order.append((i, 1))
                dfs_horiz(trie[index].children[char_to_ind(
                    cells[i].chars[1])], cur_word + cells[i].chars[1], order)
                order.pop()
                used[i] = False
        elif cells[i].typ == 1:
            if trie[index].children[char_to_ind(cells[i].chars[0])] != -1:
                mid_index = trie[index].children[char_to_ind(
                    cells[i].chars[0])]
                if trie[mid_index].children[char_to_ind(cells[i].chars[1])] != -1:
                    used[i] = True
                    order.append((i, -1))
                    dfs_horiz(trie[mid_index].children[char_to_ind(
                        cells[i].chars[1])], cur_word + cells[i].chars, order)
                    order.pop()
                    used[i] = False


tmp_order = []
dfs_horiz(0, "", tmp_order)

print(len(word_set))

threshold = 240
value = 0
max_value = 0
max_i = -1

if threshold < len(found_words):
    found_words_cyc = found_words.copy()
    for i in range(threshold):
        found_words_cyc.append(found_words[i])
    for i in range(len(found_words_cyc)):
        if i >= threshold:
            value -= evalWord(found_words_cyc[i-threshold][1])
            if value > max_value:
                max_value = value
                max_i = i - threshold
        value += evalWord(found_words_cyc[i][1])
    # found_words = sorted(found_words, key=lambda x: len(x[1]))
    # found_words.reverse()

    # print(found_words)

print(max_value, max_i)
if max_i > len(found_words):
    max_i -= len(found_words)

max_i -= 1
found_words_deq = deque(found_words)
found_words_deq.rotate(-max_i)
found_words = list(found_words_deq)

time.sleep(3)


homeCursor()

cx = 0
cy = 0


def goto(x, y):
    # global cx, cy
    # while x > cx:
    #     moveMouse(37, 0)
    #     cx = cx + 1
    # while x < cx:
    #     moveMouse(-37, 0)
    #     cx = cx - 1
    # while y > cy:
    #     moveMouse(0, 37)
    #     cy = cy + 1
    # while y < cy:
    #     moveMouse(0, -37)
    #     cy = cy - 1

    mouse.position = (1005 + 37*x, 403 + 37*y)


def moveCellTo(i, x, y):
    if cells[i].x == x and cells[i].y == y:
        return
    goto(cells[i].x, cells[i].y)
    time.sleep(0.02)
    mouseDown()
    goto(x, y)
    cells[i].x = x
    cells[i].y = y
    time.sleep(0.02)
    mouseUp()


usedCells = [[False for _ in range(4)] for _ in range(3)]

for i in range(len(cells)):
    # moveCellTo(i, 2*(i % 3), 2*(i//3))
    moveCellTo(i, 2*(cells[i].x//2), 2*(cells[i].y//2))
    if cells[i].x <= 6 and cells[i].y <= 4:
        usedCells[cells[i].y//2][cells[i].x//2] = True


def storeCell(i):
    if cells[i].x <= 6 and cells[i].y <= 4:
        return
    for x in range(4):
        for y in range(3):
            if not usedCells[y][x]:
                moveCellTo(i, 2*x, 2*y)
                usedCells[y][x] = True
                return


for i in range(len(cells)):
    storeCell(i)


def follow_order(order, skip):
    x = 0
    for i in range(len(order)):
        cell = order[i]
        if i < skip:
            x = x + 1
            if cells[cell[0]].typ == 1:
                x = x + 1
            continue
        usedCells[cells[cell[0]].y//2][cells[cell[0]].x//2] = False
        if cells[cell[0]].typ == 0:
            moveCellTo(cell[0], x, 7)
        elif cells[cell[0]].typ == 1:
            moveCellTo(cell[0], x, 7)
            x = x + 1
        else:
            if cell[1] == 0:
                moveCellTo(cell[0], x, 7)
            else:
                moveCellTo(cell[0], x, 6)
        x = x + 1


initial_time = time.time()
last_skipped = 0
jmp = False
for j in range(len(found_words)):
    if (not jmp) and len(found_words[j][1]) < board_width - 1:
        continue
    else:
        jmp = True
    order = found_words[j]
    if time.time() - initial_time > 60:
        break
    print(order[1], "*")
    follow_order(order[0], last_skipped)
    if j == len(found_words)-1:
        break

    cur_len = 0
    last_skipped = 0

    skip_rest = False

    for i in range(len(order[0])):
        if i >= len(found_words[j+1][0]):
            storeCell(order[0][i][0])
            continue

        if order[0][i] != found_words[j+1][0][i]:
            skip_rest = True

        if skip_rest:
            storeCell(order[0][i][0])
        else:
            cur_len = cur_len + 1
            last_skipped = last_skipped + 1
            if cells[order[0][i][0]].typ == 1:
                cur_len = cur_len + 1

    # cur_len = len(order[1])
    # last_skipped = len(order[0])
    # for i in reversed(range(len(order[0]))):
    #     # if order[1][:(cur_len)] == found_words[j+1][1][:(cur_len)]:
    #     #     break
    #     # ^^^ CANNOT CHECK LETTERS ONLY, have to check they have the same plan

    #     # print(order[1][:(cur_len+1)])
    #     storeCell(order[0][i][0])
    #     last_skipped = last_skipped - 1
    #     cur_len = cur_len - 1
    #     if cells[order[0][i][0]].typ == 1:
    #         cur_len = cur_len - 1
    # break


# def on_click(x, y, m, b):
#     print(x, y)

# with Listener(on_click=on_click) as listener:
#     listener.join()
