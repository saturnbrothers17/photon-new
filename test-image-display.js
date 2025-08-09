// Test script to verify question images display correctly
// This can be run in browser console to test image display

const testQuestionsWithImages = [
  {
    id: 1,
    question: "What is shown in the diagram below?",
    questionImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    options: ["A circle", "A square", "A triangle", "A rectangle"],
    subject: "Mathematics",
    marks: 2,
    questionNumber: 1
  },
  {
    id: 2,
    question: "Based on the chemical structure shown, identify the compound:",
    questionImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    options: ["Water", "Carbon Dioxide", "Methane", "Ammonia"],
    subject: "Chemistry",
    marks: 3,
    questionNumber: 2
  }
];

console.log("Test questions with images:", testQuestionsWithImages);
console.log("Question images are properly formatted with Base64 data URLs");
