# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

ASSETS=hit.mp3 hurt.mp3 shoot.mp3 naptime.mp3

all: $(ASSETS)

clean:
	-$(RM) $(ASSETS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
