#!/bin/bash
npm run build:lambda
cd assets/dist/
zip -r ../../function.zip .
cd ../../
FUNCTIONS=("create_movie" "get_movie" "update_movie" "delete_movie")
for func in "${FUNCTIONS[@]}"
do
    aws lambda update-function-code --function-name $func --zip-file fileb://function.zip
done
rm function.zip

