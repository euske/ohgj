# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

ASSETS=jump.mp3 pick.mp3 powerup.mp3 explosion.mp3 music.mp3 ending.mp3 intro.mp3

all: $(ASSETS)

clean:
	-$(RM) $(ASSETS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
