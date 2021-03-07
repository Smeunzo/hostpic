FROM toothpasteeater/node:latest

RUN mkdir -p project/

COPY . project/

WORKDIR project/

CMD npm install \
	&& sh create_folders.sh \
	&& npm start
	
