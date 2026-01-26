# iot-reporting-api

WEB-FRAMEWORK SELECTION:
For the implementation of REST API, I chose fastAPI for web framework, because - as a begginer in API's logic - is easy to learn , easy to develop with, as it reduces a significant part of human error and by reviews i read is also high performance, but i didn't test that. Also a huge advantage for me was the swagger UI feature that fastAPI provides that gave me the opportunity to test the responses of my requests without having to also create the front end, unlike flask or django.

LANGUAGE SELECTION:
The main programming language i used for the assingment was Python as it is simple, with many healpfull libraries and also works great with fastAPI. More specifically, i load my packages for the project in python Virtual Machine so it can run in other machines as well, not have to deal with conflict due to updates and also reduse the disk storage.

OS SELECTION:
I run the project in Linux using WSL for compatibility with other machines and better performance.

DATABASE LANGUAGE:
For the database implementation i used postgreSQL. Even if it would be easier for me to just use SQLite that doesn't need installation and connection with server unlike postgreSQL, all in all postegreSQL can handle more advanced queries and is a real production database. For easier develop i combine postgreSQL with SQLALchemy that can convert the python classes in the database tables making the queries easier to implement.




# TO FIX
- missing time field in SensorReading   CHECK
- consistency: 
    - get sensors, get sensor/{sensorId} return objects,
    - put sensor returns strings if db sensor but the error is a dictionary
    - ->   make every response in JSON format   CHECK *results ,*get sensors *get readings

- put and delete endpoint: sensorId is a query parameter while it should be in the path
 	/sensor/{sensorId}, to match the GET endpoint   CHECK


# TO DO
- Add validation, write unit tests (pytest)
- Write a complete README.md
- Add a .gitignore      CHECK 
- Add requirements.txt  CHECK