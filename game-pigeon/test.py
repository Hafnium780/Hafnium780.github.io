# import pyautogui
from pynput.mouse import Button, Controller
from time import sleep
import subprocess

cmd = 'osascript -e \'activate application "iPhone Mirroring"\''
subprocess.call(cmd, shell=True)

mouse = Controller()
mouse.position = (1050, 486)
sleep(0.02)
mouse.press(Button.left)
sleep(0.02)
mouse.move(56, 0)
sleep(0.02)
mouse.move(0, 56)
sleep(0.02)
mouse.move(56, 56)
sleep(0.02)
mouse.release(Button.left)


# pyautogui.moveTo(1050, 486)
# pyautogui.mouseDown(button="left")
# pyautogui.move(56, 0, 1)
# pyautogui.move(0, 56, 1)
# pyautogui.move(56, 56, 1)
