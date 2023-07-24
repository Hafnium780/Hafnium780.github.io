import time
import ctypes

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
for _ in range(3):
    moveMouse(0, 200)
moveMouse(200, 0)
moveMouse(8, 0)
mouseDown()
moveMouse(0, -98)
mouseUp()
