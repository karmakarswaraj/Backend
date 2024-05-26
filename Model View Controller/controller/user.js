const fs = require("fs");

const data = JSON.parse(fs.readFileSync('data.json', "utf-8"));

const users = data.users;

// Create POST /users
exports.create = (req, res) => {
  const newUser = req.body;
  users.push(newUser);
  res.status(201).json(newUser);
};
// Read GET /users
exports.get = (req, res) => {
  res.json(users);
};
// Read GET /users/:id
exports.getAll = (req, res) => {
  const id = +req.params.id;
  const user = users.find((p) => p.id === id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "user not found" });
  }
};
// Update PUT /users/:id
exports.replace = (req, res) => {
  const id = +req.params.id;
  const userIndex = users.findIndex((p) => p.id === id);
  if (userIndex !== -1) {
    const user = users[userIndex];
    users[userIndex] = { ...user, ...req.body, id: id };
    res.status(200).json(users[userIndex]);
  } else {
    res.status(404).json({ error: "user not found" });
  }
};
// Update PATCH /users/:id
exports.update = (req, res) => {
  const id = +req.params.id;
  const userIndex = users.findIndex((p) => p.id === id);
  if (userIndex !== -1) {
    const user = users[userIndex];
    users[userIndex] = { ...user, ...req.body };
    res.status(200).json(users[userIndex]);
  } else {
    res.status(404).json({ error: "user not found" });
  }
};
// Delete DELETE /users/:id
exports.delete = (req, res) => {
  const id = +req.params.id;
  const userIndex = users.findIndex((p) => p.id === id);
  if (userIndex !== -1) {
    const user = users.splice(userIndex, 1)[0];
    res.status(200).json(user);
  } else {
    res.status(404).json({ error: "user not found" });
  }
};
