# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

ASSETS=jump.mp3 pick.mp3 explosion.mp3 kitty.mp3 tonton.mp3

all: $(ASSETS)

clean:
	-$(RM) $(ASSETS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
