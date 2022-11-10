#!/bin/bash
#ADD DATABASE
PSQL="psql --username=freecodecamp --dbname=number_guess -t --no-align -c"
#PRESS USERNAME
echo "Enter your username:"
read USERNAME

#CHECK EXIST USER
CHECK_USERNAME=$($PSQL "SELECT name FROM username WHERE name='$USERNAME'")

RANDOM_NUMBER=$(( $RANDOM % 1000 + 1 ))
re='^[0-9]+$'
COUNT=0

if [[ -z $CHECK_USERNAME   ]]
then
    ADD_USERNAME_RESULT=$($PSQL "INSERT INTO username(name) VALUES ('$USERNAME')")
    echo "Welcome, $USERNAME! It looks like this is your first time here."
    USER_ID=$($PSQL "SELECT user_id FROM username WHERE name='$USERNAME'")  
    
    #Start play guess number
    while [[ $RANDOM_NUMBER != $NUMBER  ]]
    do
        COUNT=$(( $COUNT+1))
        echo "Guess the secret number between 1 and 1000:"
        read NUMBER
        if [[ ! $NUMBER =~ $re   ]]
        then
        echo "That is not an integer, guess again:"
        else     
            if [[ $NUMBER -lt $RANDOM_NUMBER  ]]
            then
                echo "It's higher than that, guess again:" 
            elif [[ $NUMBER -gt $RANDOM_NUMBER    ]]
            then
                echo "It's lower than that, guess again:"
            fi
        fi    
    done

    echo "You guessed it in $COUNT tries. The secret number was $RANDOM_NUMBER. Nice job!"
    INSERT_RESULT=$($PSQL "Insert into games(score,user_id) values($COUNT,$USER_ID)")
else
    USER_ID=$($PSQL "SELECT user_id FROM username WHERE name='$USERNAME'")
    QUERY=$($PSQL "select count(game_id), min(score) from games where user_id='$USER_ID'")
    NUMBER_GAMES=`echo $QUERY | cut -d'|' -f1`
    BEST_GAME=`echo $QUERY | cut -d'|' -f2`
    echo "Welcome back, $CHECK_USERNAME! You have played $NUMBER_GAMES games, and your best game took $BEST_GAME guesses."

    #Start play guess number
    while [[ $RANDOM_NUMBER != $NUMBER  ]]
    do
        COUNT=$(( $COUNT+1))
        echo "Guess the secret number between 1 and 1000:"
        read NUMBER
        if [[ ! $NUMBER =~ $re   ]]
        then
        echo "That is not an integer, guess again:"
        else     
            if [[ $NUMBER -lt $RANDOM_NUMBER  ]]
            then
                echo "It's higher than that, guess again:" 
            elif [[ $NUMBER -gt $RANDOM_NUMBER    ]]
            then
                echo "It's lower than that, guess again:"
            fi
        fi    
    done

    echo "You guessed it in $COUNT tries. The secret number was $RANDOM_NUMBER. Nice job!"
    INSERT_RESULT=$($PSQL "Insert into games(score,user_id) values($COUNT,$USER_ID)")
fi