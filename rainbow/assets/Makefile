# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

ASSETS=hurt.mp3 music.mp3 pick.mp3

all: $(ASSETS)

clean:
	-$(RM) $(ASSETS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
