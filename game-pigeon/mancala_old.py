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
    print(board, path)
    global record, record_paths, record_results, insta_win, win_path
    for x in range(6):
        copy = board.copy()
        ind = x
        first_move = True
        if copy[x] == 0:
            continue

        path.append(x)
        while first_move or copy[ind] > 1:
            first_move = False
            cur = copy[ind]
            copy[ind] = 0
            while cur > 0:
                ind = (ind + 1) % 13
                cur = cur - 1
                copy[ind] = copy[ind] + 1
            if ind == 6:
                simulate(copy, path)
                break
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
print("Record: ", record)
for i in range(len(record_paths)):
    print(f"Path {i}")
    print(record_paths[i])
    print("Board: ", record_results[i])
    print("")
# if insta_win:
#     print("Instant Win: ", win_path)
