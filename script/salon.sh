#! /bin/bash
PSQL="psql --username=freecodecamp --dbname=salon --no-align --tuples-only -c"
#pg_dump -cC --inserts -U freecodecamp salon > salon.sql
echo "Welcome to My Salon, how can I help you?"
echo ""
LIST_SERVICE="$($PSQL "select * from services")"
for SERVICE in ${LIST_SERVICE}
do
  ID=`echo $SERVICE| cut -d '|' -f1`
  NAME=`echo $SERVICE| cut -d '|' -f2`
  echo $ID")" $NAME
done

read service_id
QUERRY=$($PSQL "select * from services where service_id='$service_id'")
if [[ -z $QUERRY   ]]
then
  echo "I could not find that service. What would you like today?"
  for SERVICE in ${LIST_SERVICE}
  do
    ID=`echo $SERVICE| cut -d '|' -f1`
    NAME=`echo $SERVICE| cut -d '|' -f2`
    echo $ID")" $NAME
  done
else
  echo "What's your phone number?"
fi