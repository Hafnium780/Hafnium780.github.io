from pynput.mouse import Listener
import ctypes
import time
import numpy
import pytesseract
import cv2
from PIL import ImageGrab

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
    for _ in range(3):
        moveMouse(0, 100)
    for _ in range(3):
        moveMouse(-100, 0)


initial_time = time.time()
time.sleep(2)

while time.time() - initial_time < 45:
    boardImage = cv2.cvtColor(numpy.array(ImageGrab.grab(
        bbox=(969, 900, 1302, 910))), cv2.COLOR_BGR2GRAY)
    min_color = min(boardImage.flatten())
    xx = 0
    yy = 0
    y = 0
    for row in boardImage:
        x = 0
        for col in row:
            if col == min_color:
                xx = x
                yy = y
            x = x + 1
        y = y + 1
    homeCursor()
    moveMouse(0, -20)
    print(xx, yy)
    for _ in range(0, xx, 10):
        moveMouse(13, 0)

    mouseDown()
    moveMouse(int((333/2 - xx)/3.5), -100)
    mouseUp()
    time.sleep(0.5)

# cv2.imshow('frame', boardImage)
# cv2.waitKey(5000)
# cv2.destroyAllWindows()
# cv2.resize(cv2.bitwise_not(cv2.cvtColor(
# numpy.array(), cv2.COLOR_BGR2GRAY)), (300, 300))

# time.sleep(3)

# homeCursor()

# moveMouse(130, 0)
