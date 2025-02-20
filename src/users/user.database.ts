import { User, UnitUser, Users } from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import fs from "fs";

let users: Users = loadUsers();

function loadUsers(): Users {
  try {
    const data = fs.readFileSync("./users.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(`Error: ${error}`);
    return {};
  }
}

function saveUsers() {
  try {
    fs.writeFileSync("./users.json", JSON.stringify(users, null, 2), "utf-8");
    console.log(`User saved successfully!`);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

export const findOne = async (id: string): Promise<UnitUser | null> => users[id] || null;

export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
  let id = random();
  while (await findOne(id)) {
    id = random();
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user: UnitUser = {
    id,
    username: userData.username,
    email: userData.email,
    password: hashedPassword
  };

  users[id] = user;
  saveUsers();

  return user;
};

export const findByEmail = async (user_email: string): Promise<UnitUser | null> => {
  const allUsers = await findAll();
  return allUsers.find(result => user_email === result.email) || null;
};

export const comparePassword = async (email: string, supplied_password: string): Promise<UnitUser | null> => {
  const user = await findByEmail(email);
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(supplied_password, user.password);
  return isPasswordValid ? user : null;
};

export const update = async (id: string, updateValues: User): Promise<UnitUser | null> => {
  const userExists = await findOne(id);
  if (!userExists) return null;

  if (updateValues.password) {
    updateValues.password = await bcrypt.hash(updateValues.password, 10);
  }

  users[id] = { ...userExists, ...updateValues };
  saveUsers();

  return users[id];
};

export const remove = async (id: string): Promise<void> => {
  if (await findOne(id)) {
    delete users[id];
    saveUsers();
  }
};
