import time
import ctypes

print("Input Board:")
board = [int(input()) for _ in range(6)] + [0] + [int(input())
                                                  for _ in range(6)]
print(board)
# board = [0, 1, 4, 1, 2, 0, 0, 0, 1, 0, 0, 1, 0]


record = 0
record_paths = []
record_results = []
insta_win = False
win_path = []


def simulate(board, path):
    print(board, "\n", [p[0] for p in path], "\n\n", sep="")
    global record, record_paths, record_results, insta_win, win_path
    for x in range(6):
        copy = board.copy()
        ind = x
        first_move = True
        if copy[x] == 0:
            continue

        pickups = 0
        moveTime = 1

        while ind != 6 and (first_move or copy[ind] > 1):
            first_move = False
            pickups = pickups+1
            cur = copy[ind]
            copy[ind] = 0
            moveTime = moveTime + 0.326*cur + 0.536
            while cur > 0:
                ind = (ind + 1) % 13
                cur = cur - 1
                copy[ind] = copy[ind] + 1

        path.append((x, moveTime + pickups*0.5))
        if ind == 6:
            simulate(copy, path)
        # win = True
        # for i in range(6):
        #     if copy[i] > 0:
        #         win = False
        # if win:
        #     insta_win = True
        #     record = copy[6]
        #     win_path = path.copy()
        if record < copy[6]:
            record = copy[6]
            record_paths = [path.copy()]
            record_results = [copy.copy()]
        elif record == copy[6]:
            record_paths.append(path.copy())
            record_results.append(copy.copy())
        path.pop()


simulate(board, [])

print("\n\n\n----------\n\n\n\n")

print("Record: ", record)
for i in range(len(record_paths)):
    print(f"Path {i}")
    print([path[0] for path in record_paths[i]])
    print("Board: ", record_results[i])
    print("")

p = input("Pick a path (empty to quit): ")
try:
    if int(p) >= len(record_paths):
        exit(0)
except:
    exit(0)

time.sleep(3)


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


homeCursor()
moveMouse(0, 200)
moveMouse(0, 47)
moveMouse(95, 0)


cy = 0


def moveTo(y):
    global cy
    while y < cy:
        moveMouse(0, -41)
        cy = cy-1

    while y > cy:
        moveMouse(0, 41)
        cy = cy+1


for (i, t) in record_paths[int(p)]:
    print(f"Pressing {i}")
    moveTo(i)
    time.sleep(0.5)
    mouseDown()
    mouseUp()
    print(f"Waiting {t}")
    time.sleep(t)

print("Done!")


# Timings
# 1 - 0.89s
# 2 - 1.04s
# 3 -
# 4 - 1.63s
# 5 - 2.08s
# 6 - 2.37s


# 12 - 4.39s

# t ~ 0.326x + 0.436
# add 0.1s per chain + 1s overall to be safe
# + 0.5s per pickup
