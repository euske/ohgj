# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

AUDIOS=push.mp3 hit.mp3

all: $(AUDIOS)

clean:
	-$(RM) $(AUDIOS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
