import './App.css';
import { gql, useQuery } from '@apollo/client'

const GET_USERS = gql`
  query GetUsers {
    users {
        id
        name
        email
    }
  }
`
type User = {
  id: string
  name: string
  email: string
}

function App() {
  const { data, loading, error } = useQuery(GET_USERS);

  if(loading) return <p>ローディング中</p>;
  if(error) return <p>エラー</p>;

  return (
    <div className="App">
      <h1>GraphQL</h1>
      {data.users.map((user: User)=>(
        <div key={user.id}>Name: {user.name}</div>
      ))}
    </div>
  );
}

export default App;