//QUESTION 1

var bunny = "Rabbit"
let dog = "Bingo"
const cat = "Kitty"

console.log("----ANSWER 1----")
console.log(bunny)
console.log(dog)
console.log(cat)

//QUESTION 2

// 1bunny - invalid
// Correct version: bunny1

// _bunny - valid
// $bunny - valid
// -bunny - invalid
// Correct version: bunnyName
// @bunny - invalid
// Correct version: bunny
// bunnyName - valid

//QUESTION 3

// My prerdiction is that the code will throw an error because the variable pet is being used before it is declared. The same goes for the variable animal.

// console.log(pet);
// var pet = "lucy";

// console.log(animal);
// let animal = "tom";

//QUESTION 4

let globalAnimal = "Lion";

function animalName() {
  let localAnimal = "Rabbit";

  console.log("----ANSWER 4----");
  console.log("Local:", localAnimal);
  console.log("Global:", globalAnimal);
}

animalName();

//QUESTION 5

const bunnyAgain = {
  name: "Lucy",
  age: 3,
  isHappy: true,
};

console.log("----ANSWER 5----");
console.log(bunnyAgain.name);
console.log(bunnyAgain.age);
console.log(bunnyAgain.isHappy);

//QUESTION 6

const values = [
  3.14,
  "Lucy",
  true,
  null,
  undefined,
  Symbol("Gift"),
  { name: "Gift" },
  ["Lucy", "Tom"],
];

console.log("----ANSWER 6----");
for (let i = 0; i < values.length; i++) {
  console.log(values[i], "-", typeof values[i]);
}

// QUESTION 7
const mixedDataTypes = [
  true,
  25,
  "Gift",
  null,
  undefined,
  { name: "Tom" },
];


console.log("----ANSWER 7----");
console.log(mixedDataTypes);
console.log("Length:", mixedDataTypes.length);

// QUESTION 8
function sumBunnies() {
  const blackBunnies = 10;
  const whiteBunnies = 20;

  return blackBunnies + whiteBunnies;
}

console.log("----ANSWER 8----");
console.log(sumBunnies());

// QUESTION 9
function sumBunnies(blackBunnies, whiteBunnies) {
  return blackBunnies + whiteBunnies;
}

console.log("----ANSWER 9----");
console.log(sumBunnies(10, 20));
console.log(sumBunnies(7, 3));

//QUESTION 10

const anonymousSumBunnies = function (blackBunnies, whiteBunnies) {
  return blackBunnies + whiteBunnies;
};

const arrowSumBunnies = (blackBunnies, whiteBunnies) => {
  return blackBunnies + whiteBunnies;
};


console.log("----ANSWER 10----");
console.log(anonymousSumBunnies(10, 20));
console.log(arrowSumBunnies(7, 3));
 
//QUESTION 11

(function () {
  const blackBunnies = 10;
  const whiteBunnies = 20;

  console.log("----ANSWER 11----");
  console.log(blackBunnies + whiteBunnies);
})();

//QUESTION 12

let bunnies = [
  "Lucy",
  "Tom",
  "Molly",
  "Bella",
  "Coco",
  "Daisy",
];

bunnies.push("Mario");
bunnies.unshift("Luigi");

const lucyIndex = bunnies.indexOf("Lucy");

if (lucyIndex !== -1) {
  bunnies.splice(lucyIndex, 1);
}

console.log("----ANSWER 12----");
console.log(bunnies);

//QUESTION 13

const bunniesQuestion13 = ["Lucy", "Tom", "Molly", "Bella"];


console.log("----ANSWER 13----");
console.log("First:", bunniesQuestion13[0]);
console.log(
  "Last:",
  bunniesQuestion13[bunniesQuestion13.length - 1]
);
console.log("Tom's index:", bunniesQuestion13.indexOf("Tom"));

const bunniesCopy = [...bunniesQuestion13];
console.log("Copy:", bunniesCopy);

//QUESTION 14

const bunniesQuestion14 = ["Lucy", "Tom", "Molly", "Bella"];

console.log("----ANSWER 14----");
for (let i = 0; i < bunniesQuestion14.length; i++) {
  console.log(
    `Bunny ${bunniesQuestion14[i]} is scheduled for a checkup today.`
  );
}

//QUESTION 15

const nestedArrays = [
  ["Lucy", "Tom"],
  ["Molly", "Bella"],
];


console.log("----ANSWER 15----");
console.log(nestedArrays[0][0]);
console.log(nestedArrays[1][1]);

for (let i = 0; i < nestedArrays.length; i++) {
  for (let j = 0; j < nestedArrays[i].length; j++) {
    console.log(nestedArrays[i][j]);
  }
}

//QUESTION 16

const bunnyQ16 = {
  name: "Lucy",
  age: 3,
  isHappy: true,
};

const bunnyJSON = JSON.stringify(bunnyQ16);

console.log("----ANSWER 16----");
console.log(bunnyJSON);

//QUESTION 17

let bunnyJSONQ17 =
  '{"name":"Lucy","age":3,"isHappy":true}';

const bunnyObject = JSON.parse(bunnyJSONQ17);
console.log("----ANSWER 17----");
console.log(bunnyObject.name);
console.log(bunnyObject.age);


//QUESTION 18

let bunny_age = 3;
let dog_age = "3";

console.log("----ANSWER 18----");
console.log(bunny_age == dog_age);
console.log(bunny_age === dog_age);
console.log(bunny_age != dog_age);
console.log(bunny_age !== dog_age);
// == compares values after type conversion when necessary, while === compares both value and data type.


//QUESTION 19

const bunniesQ19 = ["Lucy", "Tom"];
const dogs = ["Max", "Rocky", "Buddy"];

console.log("----ANSWER 19----");
if (bunniesQ19.length <= dogs.length) {
  console.log("There are more dogs than bunnies");
} else {
  console.log("There are more bunnies than dogs");
}


//QUESTION 20

const bunnyHealth = "sick";

console.log("----ANSWER 20----");
// if / else if / else
if (bunnyHealth === "healthy") {
  console.log("The bunny is healthy");
} else if (bunnyHealth === "sick") {
  console.log("The bunny is sick");
} else {
  console.log("Unknown health status");
}


// switch
switch (bunnyHealth) {
  case "healthy":
    console.log("The bunny is healthy");
    break;

  case "sick":
    console.log("The bunny is sick");
    break;

  default:
    console.log("Unknown health status");
}


// ternary
const healthMessage =
  bunnyHealth === "healthy"
    ? "The bunny is healthy"
    : "The bunny is not healthy";

console.log(healthMessage);


//QUESTION 21

function checkEvenOdd(number) {
  return number % 2 === 0 ? "even" : "odd";
}

console.log("----ANSWER 21----");
console.log(checkEvenOdd(4));
console.log(checkEvenOdd(7));
console.log(checkEvenOdd(0));


//QUESTION 22

console.log("----ANSWER 22----");
console.log("for loop:");
for (let i = 0; i < 10; i++) {
  console.log(`Number ${i}`);
}

let number = 0;
  console.log("while loop:");
while (number < 10) {
  console.log(`Number ${number}`);
  number++;
}


//QUESTION 23

let countdown = 9;

console.log("----ANSWER 23----");
console.log("Countdown using while loop:");
while (countdown >= 1) {
  console.log(countdown);
  countdown--;
}

console.log("Countdown using for loop:");   
for (let i = 9; i >= 1; i--) {
  console.log(i);
}


//QUESTION 24

function sumBunniesWithValidation(
  blackBunnies,
  whiteBunnies
) {
  if (
    typeof blackBunnies !== "number" ||
    typeof whiteBunnies !== "number"
  ) {
    throw new Error(
      "Both blackBunnies and whiteBunnies must be numbers"
    );
  }

  return blackBunnies + whiteBunnies;
}

console.log("----ANSWER 24----");
try {
  console.log(sumBunniesWithValidation(10, "twenty"));
} catch (error) {
  console.log(error.message);
}


//QUESTION 25

const blackBunnies = 10;
const whiteBunnies = 5;

const totalBunnies = blackBunnies + whiteBunnies;

console.log("----ANSWER 25----");
console.log(
  "Are they equal?",
  blackBunnies === whiteBunnies
);

console.log("Total:", totalBunnies);

console.log(
  "More than 12?",
  totalBunnies > 12
);

console.log(totalBunnies > 12 ? "Yes" : "No");


console.log("BRAIN TEASERS SECTION");

console.log("----BRAIN TEASER 1----");
//my prediction is that its gonna print munch 3 times
let carrots = 3;

while (carrots) {
  console.log('munch');
  carrots--;
}
//if i deleted carrots--, it would be an infinite loop because carrots would always be 3 and never reach 0, so the condition would always be true.


console.log("----BRAIN TEASER 2----");

const brainBunnies = [
  "Lucy",
  "Tom",
  "Molly",
  "Bella",
  "Mario",
  "Luigi",
];

// FOR LOOP
console.log("FOR LOOP");
for (let i = 0; i < brainBunnies.length; i++) {
  if (brainBunnies[i].length > 4) {
    console.log(brainBunnies[i]);
  }
}

// WHILE LOOP
console.log("WHILE LOOP");
let bunnyIndex = 0;

while (bunnyIndex < brainBunnies.length) {
  if (brainBunnies[bunnyIndex].length > 4) {
    console.log(brainBunnies[bunnyIndex]);
  }

  bunnyIndex++;
}


console.log("----BRAIN TEASER 3----");

const nestedArraysBrain = [
  ["Lucy", "Tom"],
  ["Molly", "Bella"],
  ["Mario", "Luigi"],
];

let count = 1;

for (let i = 0; i < nestedArraysBrain.length; i++) {
  for (let j = 0; j < nestedArraysBrain[i].length; j++) {
    console.log(`${count}. ${nestedArraysBrain[i][j]}`);
    count++;
  }
}


console.log("----BRAIN TEASER 4----");

const happyBunnies = [
  { name: "Lucy", isHappy: true },
  { name: "Tom", isHappy: false },
  { name: "Molly", isHappy: true },
];

function countHappyBunnies(bunnies) {
  let happyCount = 0;

  for (let i = 0; i < bunnies.length; i++) {
    if (bunnies[i].isHappy === true) {
      happyCount++;
    }
  }

  return happyCount;
}

const happyCount = countHappyBunnies(happyBunnies);

console.log("Happy bunnies:", happyCount);

console.log(
  happyCount >= happyBunnies.length / 2
    ? "Most bunnies are happy"
    : "Most bunnies are not happy"
);


console.log("----BRAIN TEASER 5----");


// Snippet A output:
// 0
// 1
// 2
// 3
// 4

// Snippet B originally keeps printing 0 forever because i is never increased.

let i = 0;

while (i < 5) {
  console.log(i);
  i++;
}
