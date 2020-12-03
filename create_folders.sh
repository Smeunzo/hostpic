if [ ! -d "$(pwd)/mongoDB/data" ]; then
  echo "Create folder ./mongoDB/data";
  mkdir -p "./mongoDB/data"
fi

if [ ! -d "$(pwd)/upload/pictures/testAjoutFichier" ]; then
  echo "Create folder ./upload/pictures/testAjoutFichier"
  mkdir -p "./upload/pictures/testAjoutFichier"
fi

if [ ! -d "$(pwd)/upload/pictures" ]; then
   echo "Create folder ./upload/pictures"
   mkdir -p "./upload/pictures"
fi