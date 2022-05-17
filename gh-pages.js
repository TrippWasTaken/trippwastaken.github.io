var ghpages = require("gh-pages")

ghpages.publish(
  "public", // path to public directory
  {
    branch: "gh-pages",
    repo: "https://github.com/TrippWasTaken/trippwastaken.github.io", // Update to point to your repository
    user: {
      name: "TrippWasTaken", // update to use your name
      email: "konrad.knecht@gmail.com", // Update to use your email
    },
  },
  () => {
    console.log("Deploy Complete!")
  }
)
