# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame -t --cbr

AUDIOS=coin.mp3 gun.mp3 dead.mp3

all: $(AUDIOS)

clean:
	-$(RM) $(AUDIOS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
