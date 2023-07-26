letterToMorse = {'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
                 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
                 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
                 'Y': '-.--', 'Z': '--..'}

morseToLetter = {}
for x in letterToMorse:
    morseToLetter[letterToMorse[x]] = x

base3Morse = ['.', '-', 'x']


def ciphertextToMorse(c):
    a = ord(c) - ord('A')
    return base3Morse[a // 9] + base3Morse[(a//3) % 3] + base3Morse[a % 3]


pos = 26*26
for i in range(0, 26):
    for j in range(0, 26):
        l1 = chr(i+ord('A'))
        l2 = chr(j+ord('A'))
        l3 = ciphertextToMorse(l1) + ciphertextToMorse(l2)
        w = True
        if 'xxx' in l3 or 'xxxx' in l3:
            w = False
        l = [x for x in l3.split("x") if x]
        for x in l:
            try:
                morseToLetter[x]
            except:
                w = False
        if w == False:
            pos = pos-1
            print("0\t", end="")
        else:
            print("1\t", end="")
    print("")
