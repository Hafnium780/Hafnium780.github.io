print("Input Board:")
board = [int(input()) for _ in range(6)] + [0] + [int(input())
                                                  for _ in range(6)]
# print(board)


record = 0
record_path = []


def simulate(board, path):
    print(board, path)
    global record, record_path
    for x in range(6):
        copy = board.copy()
        ind = x
        if copy[x] == 0:
            continue

        while copy[ind] > 1:
            cur = copy[ind]
            copy[ind] = 0
            while cur > 0:
                ind = (ind + 1) % 13
                cur = cur - 1
                copy[ind] = copy[ind] + 1
            if ind == 6:
                path.append(x)
                simulate(copy, path)
                path.pop()
                break
        if record < copy[6]:
            record = copy[6]
            record_path = path.copy()


simulate(board, [])
print("Record: ", record)
print("Path: ", record_path)
