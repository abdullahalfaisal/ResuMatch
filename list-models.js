const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  const genAI = new GoogleGenerativeAI("AIzaSyDrtmzImiyiUJmGvSPOQP-n0MXMorBczkU");
  // @google/generative-ai doesn't have listModels directly in the modern SDK in the same way, but we can hit the REST endpoint
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDrtmzImiyiUJmGvSPOQP-n0MXMorBczkU");
  const data = await response.json();
  console.log(data.models.map(m => m.name).join("\n"));
}
run();
