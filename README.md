## DevOps project
### Setup

•	Clone this repo, run npm install.                                                                                                                          
•	Install redis and run on localhost:6379

Tasks:
#### /set and /get routes:

•	Create two new routes /set and /get. 

•	When /set is visited, a new key is set with the value:"this message will self-destruct in 10 seconds" with an expiration value of 10 seconds using the expire command in redis.

•	When /get is visited, that key is fetched, and value is sent back to the client. The key automatically expires after 10 sec.

#### /recent

•	Create new route /recent which will display the 5 most recently visited sites.

#### /upload and /meow

•	Upload the image to the localhost server through curl command.

•	View it in the browser by visiting the route /meow. 

•	If there are multiple images in the queue, the most recent image is viewed in the browser with the route /meow.

#### /spawn, /destroy, /listservers

•	Create a new route /spawn, which will create a new app server running on another port.

•	create a new route destroy, which will destroy a random server. The available servers are stored in redis queue.

•	The available servers can be observed by visiting the /listservers command.

#### Demonstrate Proxy server

•	Create a proxy that will uniformly deliver requests to available servers.
NOTE: http://localhost:3000 is used as the main server and everytime a request is sent to '/' route, the request gets redirected to one of the available servers

###Screencast Link
[screencast link](https://youtu.be/Z3mKxHzZWYs)





