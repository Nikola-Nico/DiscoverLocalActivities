import { useActivities } from './FetchData.tsx';


function Cards() {
  const { data, loading, error } = useActivities();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;


  // TODO: render the activities in a nice card format.
  return (
    <>
      <div>Design here (Mozhe da se koristi tailwindcss)</div>
      {/* {data[1].name}  Example of how you can access the activity data. You should replace this with your actual card rendering logic.*/}
      {/* {data.map(activity => (
        <div key={activity.id} className="border p-4 rounded mb-4">
          <h2 className="text-xl font-bold">{activity.name}</h2>
        </div>
      ))} */}
    </>
  );
}

export default Cards;