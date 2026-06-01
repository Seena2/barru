import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    //make http request to load users from backend server
    axios
      .get("/api/users")
      .then(
        //set the fetched data to 'users' state,
        //note axios store it data on 'data' object
        (res) => {
          setUsers(res.data);
        }
      )
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <div className="App">
        <h1>All users</h1>
        {users.map((user) => (
          <div key={user.id}>
            <h3>Name: {user.name}</h3>
            <p>Age:{user.age}</p>
          </div>
        ))}
      </div>
    </>
  );
}
export default App;
