# from pynput.keyboard import Listener
import ctypes
import time
# import numpy
# import pytesseract
# import cv2
# from PIL import ImageGrab

# Construct trie from wordlist

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
    if len(word) < 3:
        continue
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

# Mouse movement


def moveMouse(dx, dy):
    ctypes.windll.user32.mouse_event(1, dx, dy, 0, 0)
    time.sleep(0.02)


def mouseDown():
    ctypes.windll.user32.mouse_event(2, 0, 0, 0, 0)
    time.sleep(0.01)


def mouseUp():
    ctypes.windll.user32.mouse_event(4, 0, 0, 0, 0)
    time.sleep(0.01)


def homeCursor():
    for _ in range(5):
        moveMouse(0, -100)
    for _ in range(5):
        moveMouse(-100, 0)


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


while True:
    # Start the game

    # homeCursor()

    # for _ in range(3):
    #     moveMouse(0, 100)

    # moveMouse(0, 50)
    # moveMouse(140, 0)

    # time.sleep(0.5)
    # mouseDown()
    # mouseUp()

    # time.sleep(3)

    # Grab board from TeamViewer
    # pytesseract.pytesseract.tesseract_cmd = 'C:\Program Files\Tesseract-OCR\\tesseract.exe'
    left = 1022
    right = 1210
    top = 560
    bottom = 745

    width = 45
    height = 45

    board = [['T', 'E', 'S', 'T'], ['T', 'E', 'S', 'T'],
             ['T', 'E', 'S', 'T'], ['T', 'E', 'S', 'T']]
    board_width = 4
    board_height = 4

    print("input board:\n")
    manual_board = input()
    manual_index = 0
    time.sleep(4)

    i = 0
    for x in range(left, right+1, int((right - left)/3)):
        j = 0
        for y in range(top, bottom+1, int((bottom - top)/3)):
            # boardImage = cv2.resize(cv2.bitwise_not(cv2.cvtColor(
            #     numpy.array(ImageGrab.grab(bbox=(x, y, x + width, y + height))), cv2.COLOR_BGR2GRAY)), (300, 300))
            # thresh = cv2.threshold(boardImage, 150, 255,
            #                        cv2.THRESH_BINARY_INV)[1]
            # result = cv2.GaussianBlur(thresh, (5, 5), 0)
            # boardText = pytesseract.image_to_string(
            #     result, lang='eng', config='--psm 10 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            # board[j][i] = boardText[:1].upper()
            board[j][i] = manual_board[manual_index].upper()
            manual_index = manual_index + 1
            # if board[j][i] == "0":
            #     board[j][i] = 'O'
            # if board[j][i] == '|' or board[j][i] == ']' or board[j][i] == '[':
            #     board[j][i] = 'I'
            # cv2.imshow('frame', result)
            # cv2.waitKey(400)
            # cv2.destroyAllWindows()
            j = j+1
        i = i+1

    print(board)

    # Generate paths

    mx = [-1, 0, 1, 1, 1, 0, -1, -1]
    my = [-1, -1, -1, 0, 1, 1, 1, 0]

    vis = [[False for i in range(4)] for j in range(4)]
    found_words = {}
    found_paths = []
    expected_score = 0

    def dfs(x, y, index, path, word):
        global expected_score
        vis[y][x] = True
        if trie[index].is_word and (not (word in found_words)) and len(word) > 2:
            found_words[word] = True
            found_paths.append((path.copy(), word))
            expected_score = expected_score + evalWord(word)
        for mv in range(8):
            nx = x + mx[mv]
            ny = y + my[mv]
            # print(board[ny][nx], trie[index].children[char_to_ind(board[ny][nx])])
            if nx < 0 or nx >= board_width or ny < 0 or ny >= board_height or trie[index].children[char_to_ind(board[ny][nx])] == -1 or vis[ny][nx]:
                continue
            path.append((nx, ny))
            dfs(nx, ny, trie[index].children[char_to_ind(
                board[ny][nx])], path, word + board[ny][nx])
            path.pop()
        vis[y][x] = False

    print("Finding Paths...")
    for x in range(board_width):
        for y in range(board_height):
            path = [(x, y)]
            dfs(x, y, trie[0].children[char_to_ind(
                board[y][x])], path, board[y][x])

    found_paths = sorted(found_paths, key=lambda x: len(x[1]))
    found_paths.reverse()

    # Follow paths

    def gotoAdjCell(cx, cy, x, y):
        if x == cx and y == cy:
            return
        if x == cx:
            if cy > y:
                moveMouse(0, -36)
            else:
                moveMouse(0, 36)
        elif y == cy:
            if cx > x:
                moveMouse(-36, 0)
            else:
                moveMouse(36, 0)
        else:
            if cx > x and cy > y:
                moveMouse(-31, -31)
            elif cx > x and cy < y:
                moveMouse(-31, 31)
            elif cx < x and cy > y:
                moveMouse(31, -31)
            elif cx < x and cy < y:
                moveMouse(31, 31)

    def gotoCell(cx, cy, x, y):
        while cx < x:
            moveMouse(36, 0)
            cx = cx+1
        while cx > x:
            moveMouse(-36, 0)
            cx = cx-1
        while cy < y:
            moveMouse(0, 36)
            cy = cy+1
        while cy > y:
            moveMouse(0, -36)
            cy = cy-1

    ccx = 0
    ccy = 0

    def followPath(path):
        global ccx
        global ccy
        # homeCursor()
        # for _ in range(2):
        #     moveMouse(0, 100)

        # moveMouse(0, 40)
        # moveMouse(53, 0)
        (cx, cy) = path[0]
        gotoCell(ccx, ccy, cx, cy)
        # # time.sleep(1)
        diags = []
        mouseDown()
        for (x, y) in path[1:]:
            gotoAdjCell(cx, cy, x, y)
            if cx != x and cy != y:
                diags.append((cx-x, cy-y))
            cx = x
            cy = y
        mouseUp()

        for (x, y) in reversed(diags):
            if x == -1 and cx == 0:
                gotoAdjCell(cx, cy, cx+1, cy)
                cx = cx+1
            elif x == 1 and cx == 3:
                gotoAdjCell(cx, cy, cx-1, cy)
                cx = cx-1
            if y == -1 and cy == 0:
                gotoAdjCell(cx, cy, cx, cy+1)
                cy = cy+1
            elif y == 1 and cy == 3:
                gotoAdjCell(cx, cy, cx, cy-1)
                cy = cy-1
            gotoAdjCell(cx, cy, cx+x, cy+y)
            cx = cx + x
            cy = cy + y
            # time.sleep(1)
        ccx = cx
        ccy = cy

    homeCursor()
    moveMouse(0, 80)

    moveMouse(0, 44)
    moveMouse(41, 0)

    initial_time = time.time()
    print("Expected Score: " + str(expected_score))
    # if expected_score < 200000:
    #     print("Skipping because too low")
    #     continue
    print("Following Paths...")
    finished = True
    for path in range(len(found_paths)):
        print(found_paths[path][1])
        followPath(found_paths[path][0])
        if time.time() - initial_time > 70:
            finished = False
            break
    if finished:
        print("Done - All words!")
    else:
        print("Done - Time!")
