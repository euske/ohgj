# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

AUDIOS=crash.mp3 music.mp3

all: $(AUDIOS)

clean:
	-$(RM) $(AUDIOS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
