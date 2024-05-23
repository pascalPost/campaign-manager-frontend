import { factory, primaryKey } from "@mswjs/data";
import { type User } from "@/components/users.tsx";

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice",
    email: "alice@aol.com",
  },
  {
    id: "2",
    name: "Bob",
    email: "bob@aol.com",
  },
  {
    id: "3",
    name: "Dennis",
    email: "dennis@aol.com",
  },
];

// Create a "db" with an user model and some defaults
export const db = factory({
  user: {
    id: primaryKey(String),
    name: () => "Firstname",
    email: () => "email@email.com",
  },
});

// create 3 users
mockUsers.forEach((user) => db.user.create(user));

export { mockUsers };
