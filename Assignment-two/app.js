/*
PART A

Question 1. 
GET /get-student-by-name?name=Ada

const students = await Student.find({ name });
I used find() here because there can be more than one student with the
same name. So if there are two students called Ada, both of them will
be returned in an array.

For example,

{
  "message": "Student(s) fetched successfully",
  "students": [
    {
      "name": "Ada",
      "age": 20
    },
    {
      "name": "Ada",
      "age": 22
    }
  ]
}

If I used findOne() instead, only one matching student would be returned.
So i will use findOne() if I want to return only one student with the name Ada,
and i will use find() if I want to return all students with the name Ada.
*/

/*
Q2.

The current search,

const students = await Student.find({ name });
is case-sensitive, so "Ada", "ada" and "ADA" are treated differently.

To make it case-insensitive, I can use:

const students = await Student.find({
  name: { $regex: name, $options: "i" }
});

The "i" makes the search case-insensitive, and MongoDB does the
matching directly instead of fetching all students into Node.js first.
*/


/*
Question 3.

The update uses
const student = await Student.findByIdAndUpdate(
  req.params.id,
  req.body,
  { new: true }
);

One reason the update may not work is if the request is sent wrongly,
for example using the wrong ID, URL, HTTP method or request body.

Another reason is the Mongoose options. The "new: true" makes the
updated document be returned. Also, "runValidators: true" can be used
to make sure the updated values follow the schema rules.
*/


/*
Question 4.

If the ID is valid and the student exists, the route returns the
student with a 200 status.

If the ID is valid but no student has that ID, findById() returns null.
The current code still returns 200 because it does not check for null.

If an invalid ID like "abc123" is used, Mongoose throws a CastError
because it cannot convert it to a valid MongoDB ObjectId. The current
code catches the error and returns 500.

If the ID is valid first and return 400
for an invalid ID, and 404 when the ID is valid but the student does
not exist.
*/


/*
Question 5.

const Student = mongoose.model("Student", studentSchema);

Mongoose will turn "Student" into "students" when creating
the MongoDB collection.

So the actual collection is likely called "students", not "Student".
If I query the wrong collection name directly, I may not get any
students even though they exist in the database.
*/


/*
Question 6. 
The line that makes req.body work is
app.use(express.json());

If the request does not have Content-Type: application/json, Express
may not properly read the JSON data sent in the request body. This can
make req.body undefined or empty, causing the student creation to fail
or save missing values.
*/

//PART B

const express = require("express");
const mongoose = require("mongoose");
const app = express();

const port = 4556;

app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Assignment-two");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

connectDB();

const studentSchema = new mongoose.Schema({
  name: {
  type: String,
  required: true,
  },
  age: Number,
  email: {
  type: String,
  required: true,
  unique: true,
  },
  phone: String,
  address: String,
  course: {
  type: String,
  minlength: 2,
  },
  institution: String,
});

const Student = mongoose.model("Student", studentSchema);

app.get("/", (req, res) => {
  res.send("Hello World");
});


app.post("/students", async (req, res) => {
  const {
    name,
    age,
    email,
    phone,
    address,
    course,
    institution,
  } = req.body;

  try {
  const student = new Student({
    name,
    age,
    email,
    phone,
    address,
    course,
    institution,
  });

  await student.save();

  return res.status(201).json({
    message: "Student created successfully",
    student,
  });
} catch (error) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Email already exists",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Name and email are required",
      error: error.message,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}
});


app.get("/search-students", async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({
      message: "Search query is required",
    });
  }

  try {
    const students = await Student.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { course: { $regex: q, $options: "i" } },
      ],
    });

    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});



app.get("/get-students", async (req, res) => {
  try {
    const students = await Student.find();

    return res.status(200).json({
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});


app.get("/get-student/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid student ID",
    });
  }

  try {
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student fetched successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});


app.get("/get-student-by-name", async (req, res) => {
  const { name } = req.query;

  try {
    const students = await Student.find({ name });

    return res.status(200).json({
      message: "Student(s) fetched successfully",
      students,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});



app.patch("/students/:id/course", async (req, res) => {
  const { id } = req.params;
  const { course } = req.body;

  if (!course || course.trim() === "") {
    return res.status(400).json({
      message: "Course is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid student ID",
    });
  }

  try {
    const student = await Student.findByIdAndUpdate(
      id,
      { course },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      student,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid course",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});


app.put("/update-student/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});


app.delete("/delete-student/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid student ID",
    });
  }

  try {
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.status(200).json({
      message: "Student deleted successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});