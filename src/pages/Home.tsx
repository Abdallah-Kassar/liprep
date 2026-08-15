import { Link } from "react-router-dom";
import {handleJSONUpload} from "@/db.ts"
//import parse from "html-react-parser"
function Home(){
    const sampleData = {
    '2026-08-02': 5,
    '2026-08-05': 12,
    '2026-08-10': 3,
    '2026-08-14': 25, // Highest intensity
    '2026-08-18': 18,
    '2026-08-22': 9,
    '2026-08-28': 15,
  };
    
    return(
        <>
            <h1>HOME BABY</h1>

            <input type="file" name="JSONUpload" id="json-upload" onChange={handleJSONUpload} />
            
            <br></br>
            <br></br>
            <br></br>
            <Link to="/filter">Filter questions</Link>

            


        </>
    );
}

export default Home;