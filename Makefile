REACT_DIR = ./frontend
STATIC_DIR = ./app/static/expense-tracker

run:
	make -C app run

build:
	mkdir -p $(STATIC_DIR)
	cd $(REACT_DIR) && yarn install && yarn build
	mv $(REACT_DIR)/build/* $(STATIC_DIR)
