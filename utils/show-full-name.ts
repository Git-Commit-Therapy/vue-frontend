import type { User } from "~/composable/protobuf/frontend/user";

export function showFullName(user: User) {
  return user.name + " " + user.surname + ", " + user.id;
}
