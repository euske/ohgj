# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

AUDIOS=beep.mp3 eat.mp3 wolf.mp3 dead.mp3 music.mp3

all: $(AUDIOS)

clean:
	-$(RM) $(AUDIOS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
