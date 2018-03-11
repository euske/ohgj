# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame -t --cbr

AUDIOS=beep.mp3 step.mp3 attack.mp3 pickup.mp3 gameover.mp3

all: $(AUDIOS)

clean:
	-$(RM) $(AUDIOS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
