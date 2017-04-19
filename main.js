var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
var http = require('http')
//var cache = require('express-redis-cache')
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
var port_num = 3000

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	// ... INSERT HERE
	client.lpush("urllist", req.url, function(err, reply) {
		console.log(reply);
	}); 
	client.ltrim("urllist", 0, 4);
	
	next(); // Passing the request to the next handler in the stack.
});


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
    console.log(req.body) // form fields
    console.log("the files obj is ") // form files
    console.log(JSON.stringify(req.files))

    if( req.files )
    {
    	var images = []
    	images = Object.keys(req.files)
    	console.log(images)
    	images.forEach(function(image) {
    		fs.readFile( req.files[image].path, function (err, data) {
    			if (err) throw err;
    			var img = new Buffer(data).toString('base64');
    			console.log("the image is " + req.files[image].path	);
    			client.lpush("imagelist", img, function(err, data) {
    				if (err) throw err;
    			});	
    		});

    	})

    }

    res.status(204).end()
}]);

app.get('/meow', function(req, res) {
	client.lpop("imagelist", function(err, data) {
		if(!data){
			res.writeHead(200, {'content-type':'text/html'});
			res.write("<h1>No image in redis</h1>");
			res.end();
		}
		else{
			console.log("the dat is "+ data)
			res.writeHead(200, {'content-type':'text/html'});
			res.write("<h1>\n<img src='data:my_pic.jpg;base64,"+data+"'/>");
			res.end();
		}
	});

});

// HTTP SERVER
var server = app.listen(port_num, function () {

	var host = server.address().address
	var port = server.address().port

	console.log('Example app listening at http://%s:%s', host, port)
	port_num++
	client.del("spawnedserver")

})

app.get('/', function(req, res) {

	// console.log("hi");
	// res.send('hi');

	client.rpoplpush("spawnedserver", "spawnedserver", function (err, redirectPort){
		// console.log(err)
		console.log("redirtect port is :" + redirectPort)
		if (!redirectPort) {
			res.send('No spawned servers to redirect request to')
			return
		}

		res.redirect('http://localhost:'+redirectPort)
	})

});

app.get('/set', function(req, res){

	res.send('key set');

	client.set("key", "this message will self-destruct in 10 seconds");
	client.expire("key", 10)
});

app.get('/get', function(req, res) {

	client.get("key", function(err,value){ 
		console.log(value);
		res.send(value);});
});

app.get('/recent', function(req, res) {		

	client.lrange("urllist", 0, -1, function(err, messages) {		
		console.log(messages);		

		res.send('The 5 recently visited sites are: '+messages); });		

});

app.get('/spawn', function(req, res) {

	var new_app = express()
	var new_server = new_app.listen(port_num, function () {

		var host = new_server.address().address
		var port = new_server.address().port
		port_num++
		console.log('Example app listening at http://%s:%s', host, port)

		client.lpush("spawnedserver", port)


		new_app.get('/', function (req, res) {
			res.send('This is the newly spawned server running on port :' + port)
		})	

		new_app.get('/delete', function (req, res) {
			res.send('deleted this server running on : '+ port)
			setTimeout(function() {
				new_server.close()
			}, 100)

		})

	})
	res.send('new app server started on port '+ port_num)


})	

app.get("/destroy", function(req, res) {
	client.rpop("spawnedserver", function(err, targetPort) {
		if (!targetPort) {
			res.send('no servers running to destory')
			return
		}
		console.log(targetPort)
		var options = {
			host: 'localhost',
			path: '/delete',
			port: targetPort,
		};

		http.get(options, function(response) {

			// console.log(response)
			res.send('Deleted server running on ' + targetPort)

		})
	})
})


app.get('/listservers', function(req, res) {
	client.lrange("spawnedserver", 0, -1, function (err, reply) {
		console.log(reply)
		res.send(reply)
	})
})
