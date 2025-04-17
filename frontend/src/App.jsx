import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold">Smart Campus Services Portal</h1>
      <button
        onClick={() => setCount(count + 1)}
        className="mt-4 bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
      >
        Count is {count}
      </button>
    </div>
  );
}

export default App;