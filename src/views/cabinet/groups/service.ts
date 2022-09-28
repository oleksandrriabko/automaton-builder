import { Group } from "../../../types";

export const processGroupData = (data: Array<Group>): any => {
  return data.map((group: Group) => {
    const groupRow = {
      id: group.id,
      title: group.title,
      usersAmount: group.users ? group.users.length : 0,
      labsAmount: group.labs ? group.labs.length : 0,
    };
    return groupRow;
  });
};
