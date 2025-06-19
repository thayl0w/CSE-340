const bcrypt = require("bcryptjs");

async function test() {
  const plainPassword = "I@mABas1cCl!3nt";

  // Hash the password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  console.log("Hashed password:", hashedPassword);

  // Compare the password with the hashed version
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log("Password match:", isMatch); // This should print: true
}

test();