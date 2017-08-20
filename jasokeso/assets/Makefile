# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame -t --cbr

AUDIOS=j0.mp3 j1.mp3 j2.mp3 won.mp3 lost.mp3 beep.mp3

all: $(AUDIOS)

clean:
	-$(RM) $(AUDIOS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
