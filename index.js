// The normal way to declare express and app
// const express = require('express')
// const app = express()

import http from "http";

import express from "express";
const app = express();

import cors from "cors";
import Note from "./models/note.js";
// import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// if (process.argv.length < 3) {
//   console.log("give password as argument");
//   process.exit(1);
// }

//const password = "poster";
// const url = process.env.MONGODB_URI;
// process.exit();

//const url = `mongodb+srv://ag4373:${password}@cluster0.vdlmx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//   `mongodb+srv://ag4373:${password}@cluster0.o1opl.mongodb.net/?retryWrites=true&w=majority`
//    `mongodb+srv://ag4373:${password}@cluster0.o1opl.mongodb.net/noteApp?retryWrites=true&w=majority`

// mongoose.set("strictQuery", false);

// mongoose.connect(url);

// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// });

// //This helps to filter out the version
// //Begins
// noteSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });
// //Ends

//const Note = mongoose.model("Note", noteSchema);

/* This code only response with Hello World
const app = http.createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Hello World");
});*/

//Middleware is used like this:
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(express.static("dist"));
app.use(express.json());
app.use(requestLogger);

// const corsOptions = {
//   origin: "http://localhost:5174", // Allow only this origin
//   methods: "GET, POST, PUT, DELETE",
//   allowedHeaders: "Content-Type",
// };
app.use(cors());

let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true,
  },
];

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { "Content-Type": "application/json" });
//   response.end(JSON.stringify(notes));
// });

//Searching for a record my ID
app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })

    .catch((error) => next(error));
});

// Updating a record
app.put("/api/notes/:id", (request, response, next) => {
  const { content, important } = request.body;

  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

// //Openning of Posting a file
// const generateId = () => {
//   const maxId =
//     notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0;
//   return String(maxId + 1);
// };

// app.post("/api/notes", (request, response) => {
//   const body = request.body;

//   if (!body.content) {
//     return response.status(400).json({
//       error: "content missing",
//     });
//   }

//   const note = {
//     content: body.content,
//     important: Boolean(body.important) || false,
//     id: generateId(),
//   };

//   notes = notes.concat(note);

//   response.json(note);
// });
// //Closing of Posting a File

//Saving inside a database
//Start
app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});
//End

// This is normal way of getting record especially when mongo DB is not envolved
// app.get("/api/notes", (request, response) => {
//   response.json(notes);
// });

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
