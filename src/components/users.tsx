import { useQuery } from "react-query";
import axios from "axios";

type User = {
  id: string;
  name: string;
  email: string;
};

async function getUsers() {
  try {
    const response = await axios.get<User[]>(`http://localhost:8000/api/users`);
    if (!response.data) {
      throw new Error(response.status.toString());
    }
    return JSON.stringify(response.data);
  } catch (error) {
    console.log(error);
  }
}

function Users() {
  const { isLoading } = useQuery("users", getUsers);

  if (isLoading) {
    return <div>Loading Users...</div>;
  }

  return <div>Users</div>;

  // return (
  //   <>
  //     <div>Users</div>
  //     <ul>
  //       {users.map((user) => (
  //         <li key={user.id}>
  //           <div>Name: {user.name}</div>
  //         </li>
  //       ))}
  //     </ul>
  //   </>
  // );
}

export { Users, type User };
