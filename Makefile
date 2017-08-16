SRC_DIR = src/
ZIP_FILE = K-StopWatch.zip

zip:
	cd $(SRC_DIR) && zip -r $(CURDIR)/$(ZIP_FILE) *

