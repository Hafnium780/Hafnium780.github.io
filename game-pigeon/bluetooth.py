import serial
import time
import pyautogui

pyautogui.PAUSE = 0
SerialPort = serial.Serial("COM7", 38400)

cclick = False

while True:
    IncomingData = SerialPort.readline()
    if (IncomingData):
        data = (IncomingData).decode('utf-8').strip().split(" ")
        x = int(data[1])
        y = int(data[0])
        click = int(data[2])
        print(x, y, click)
        if (abs(y) > 3):
            pyautogui.moveRel(0, -y)
        if (abs(x) > 3):
            pyautogui.moveRel(x, 0)
        if (click and not cclick):
            pyautogui.leftClick()
            cclick = True
        if (not click):
            cclick = False
    time.sleep(0.001)
