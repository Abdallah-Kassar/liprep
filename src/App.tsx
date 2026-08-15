import { Route, Routes } from "react-router-dom";
import Home from "@/pages/Home"
import Practice from "@/pages/Practice"
import "./App.css";
import Filter from "./pages/Filter";

function App() {
	return (
	<>
		<Routes>
            <Route path="/" element={<Home/>} />
			<Route path="/practice" element={<Practice/>}/>
			<Route path="/filter" element={<Filter/>}/>
        </Routes>
	</>
	);
}

export default App;
