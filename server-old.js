app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		// to support URL-encoded bodies
		extended: true,
	})
);

app.get("/character/:id", function (request, response) {
	console.log("param", request.params, "datais", request.data);
	var char = db
		.get("characters")
		.find({
			id: request.params.id,
		})
		.value();
});

app.get("/characters", function (request, response) {
	response.json(
		writeJsonToArchive("characters", db.get("characters").value())
	);
});

app.post("/character/:id", function (request, response) {
	console.log("param", request.params, "data", request.body);
	var char = db
		.get("characters")
		.find({
			id: request.params.id,
		})
		.value();
	console.log(char);
	try {
		if (char.selected) {
			response.json({
				result: false,
			});
		} else {
			/**
      char.selected = true;
      char.player = request.body.user;
      var data = db
        .get("posts")
        .find({
          id: request.params.id
        })
        .assign(char)
        .write();
        **/
			response.json({
				result: true,
				data: data,
			});
		}
	} catch (e) {
		console.log("error", e);
		response.json({
			result: false,
		});
	}
});

app.get("/text/:date/:col", function (request, response) {
	console.log("param", request.params, "data", request.body);
	var html = markdownHandler.process(request.params.date, request.params.col);
	fs.mkdir(
		"./docs/json/text/" + request.params.date,
		{ recursive: true },
		(err) => {
			var path = "text/" + request.params.date + "/" + request.params.col;
			writeJsonToArchive(path, { result: true, data: html });
			if (err) throw err;
		}
	);
	response.json({
		result: true,
		data: html,
	});
});

app.get("/archive/:date", function (request, response) {
	var html = getMainTemplate(request.params.date, true);

	response.send(html);
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
	var fileName = "./text/";
	var files = fs.readdirSync(fileName);
	console.log("Current date:", files[files.length - 1]);
	var html = getMainTemplate(files.pop(), null, files);

	response.send(html);
	//response.sendFile(__dirname + "/views/index.html");
});
app.get("/template", function (request, response) {
	response.sendFile(__dirname + "/views/template.html");
});

app.get("/docs", async function (request, response) {
	var fileName = "./text/";
	var files = fs.readdirSync(fileName);
	var publicFileNames = "./public/";
	var publicFiles = fs.readdirSync(publicFileNames);
	console.log("Current date:", files[files.length - 1]);
	//var indexHtml = getMainTemplate(files.pop());
	var indexHtml = getMainTemplate(files[files.length - 1]);
	var promises = [];
	promises.push(
		new Promise(function (resolve, reject) {
			fs.writeFile("./docs/index.html", indexHtml, (err) => {
				// throws an error, you could also catch it here
				if (err) {
					reject(err);
					console.log("File Write Error", err);
				}
				// success case, the file was saved
				resolve(true);
				console.log("Index saved!");
			});
		})
	);

	files.forEach(function (fileName) {
		var aHtml = getMainTemplate(fileName, true);
		promises.push(
			new Promise(function (resolve, reject) {
				fs.writeFile(
					"./docs/archive/" + fileName + ".html",
					aHtml,
					(err) => {
						// throws an error, you could also catch it here
						if (err) {
							reject(err);
							console.log("File Write Error", err);
						}

						// success case, the file was saved
						console.log("File saved saved!");
						resolve(true);
					}
				);
			})
		);
	});

	publicFiles.forEach(function (fileName) {
		promises.push(
			new Promise(function (resolve, reject) {
				fs.copyFile(
					publicFileNames + fileName,
					"./docs/" + fileName,
					(err) => {
						// throws an error, you could also catch it here
						if (err) {
							reject(err);
							console.log("File Write Error", err);
						}

						// success case, the file was saved
						console.log("File saved saved!");
						resolve(true);
					}
				);
			})
		);
	});
	await Promise.all(promises);
	//var html = getMainTemplate(files[files.length - 1]);
	console.log("Serve Built File");
	response.sendFile(__dirname + "/docs/index.html");
});
app.get("/docs/archive/:date", function (request, response) {
	response.sendFile(
		__dirname + "/docs/archive/" + request.params.date + ".html"
	);
});
app.get("/docs/:fileName", function (request, response) {
	response.sendFile(__dirname + "/docs/" + request.params.fileName);
});

app.get("/grid", async function (request, response) {
	var grid = await gridHandler.getDatagrid();
	response.send(grid);
});

// Factions

app.get("/faction/", function (request, response) {
	console.log("param", request.params, "data", request.body);
	try {
		/**
      char.selected = true;
      char.player = request.body.user;
      var data = db
        .get("posts")
        .find({
          id: request.params.id
        })
        .assign(char)
        .write();
        **/
		response.json({
			result: true,
			data: Clocks.tables("factions"),
		});
	} catch (e) {
		console.log("error", e);
		response.json({
			result: false,
		});
	}
});

app.get("/faction/:id", function (request, response) {
	console.log("param", request.params, "data", request.body);
	try {
		/**
      char.selected = true;
      char.player = request.body.user;
      var data = db
        .get("posts")
        .find({
          id: request.params.id
        })
        .assign(char)
        .write();
        **/
		response.json({
			result: true,
			data: Clocks.getFaction(request.params.id),
		});
	} catch (e) {
		console.log("error", e);
		response.json({
			result: false,
		});
	}
});

app.get("/faction/:id/clocks", function (request, response) {
	console.log("param", request.params, "data", request.body);
	try {
		response.json({
			result: true,
			data: Clocks.getFactionClocks(request.params.id),
		});
	} catch (e) {
		console.log("error", e);
		response.json({
			result: false,
		});
	}
});

app.post("/faction/create", function (request, response) {
	console.log("param", request.params, "data", request.body);
	try {
		response.json({
			result: true,
			data: Clocks.setFaction(request.body.name, request.body.abrv),
		});
	} catch (e) {
		console.log("error", e);
		response.json({
			result: false,
		});
	}
});

app.post("/faction/:id", function (request, response) {
	console.log("param", request.params, "data", request.body);
	try {
		response.json({
			result: true,
			data: Clocks.setFactionName(request.body.name, request.params.id),
		});
	} catch (e) {
		console.log("error", e);
		response.json({
			result: false,
		});
	}
});

app.post("/faction/:id/clocks/", function (request, response) {
	console.log("param", request.params, "data", request.body);
	try {
		response.json({
			result: true,
			data: Clocks.setFactionClocks(
				request.params.id,
				request.body.name,
				request.body.level,
				request.body.type
			),
		});
	} catch (e) {
		console.log("error", e);
		response.json({
			result: false,
		});
	}
});
