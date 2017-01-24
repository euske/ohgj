# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame -t --cbr

AUDIOS=song.mp3 bombed.mp3 coin.mp3

all: $(AUDIOS)

clean:
	-$(RM) $(AUDIOS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
