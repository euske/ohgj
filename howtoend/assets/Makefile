# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

ASSETS=beep.mp3 spawn.mp3 explosion.mp3 bomber.mp3 agrace.mp3

all: $(ASSETS)

clean:
	-$(RM) $(ASSETS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
