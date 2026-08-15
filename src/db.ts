import Dexie, { type EntityTable } from "Dexie"
import { topicCodes } from "./components/TopicTree";
const db = new Dexie("QuestionsDB") as Dexie & {
    QDB:EntityTable<object>
};

const progressDb = new Dexie("ProgressDB") as Dexie &{
    progressTable:EntityTable<object>
}

db.version(1).stores({QDB:"questionId,score_band_range_cd,skill_cd,[skill_cd+score_band_range_cd]"});
progressDb.version(1).stores({progressTable: "questionId, skill_cd"});
//progressDb.progressTable.add({questionId:"test", skill_cd:"WIC"})

async function handleJSONUpload(event){
    try{
        const file = event.target.files[0];
        const text = await file.text();
        const json = JSON.parse(text);
        db.QDB.clear();
        for(const question of Object.values(json)){
            db.QDB.add(question);
        }
    }catch(err){
        console.log("Could not upload the file");
        console.log(err)
    }

}

async function getQuestions() {
    const filtersString = sessionStorage.getItem("filters")
    if(filtersString == null){console.log("No filters found"); return -1; }
    const filters = JSON.parse(filtersString);
    const all_combinations = [];
    for(const subtopic of filters.subtopics){
        for(const level of filters.difficultyLevels){
            all_combinations.push([subtopic, level]);
        }
    }   
    const questionsArray = await db.QDB.where("[skill_cd+score_band_range_cd]").anyOf(all_combinations).toArray();
    if(filters.solvedStatus != "all"){
        const progress = await progressDb.progressTable.toCollection().primaryKeys();
        const progressSet = new Set(progress);
    
        const filteredQuestionsArray: object[] = []
        for(const question of questionsArray){
            if(filters.solvedStatus == "unsolved"){
                if(progressSet.has(question.questionId) == false){
                    filteredQuestionsArray.push(question)
                }
            }else{ //filters.solvedStatus == solved
                if(progressSet.has(question.questionId) == true){
                    filteredQuestionsArray.push(question)
                }
            }
        }
        return filteredQuestionsArray;
    }else{

        return questionsArray;
    }
    

}
/*
    the question has:
    questionId: ""
    skill_cd: "" (codeName for the subtopics)
    score_band_range_cd: 1 ~ 7 (how hard is it)
    content: {
        inside .content there is :
        -"stimulus": the passage, contains the images and tables (in form of svg and HTML tables etc)
        -"stem": the question after the passage
        -"type": "mcq" (multiple choice question) or "spr" (student-produced response)
        -"answerOptions": only if it is mcq, simply the choices
        -"correct_answer": an array, one element if mcq (denoting the char of the option: A,B,C,or D)
                                     multiple elements if spr.
    }

    anything with text (stem, stimulus, answerOptions) are HTML strings, use import parse from "html-react-parser" to translate them into normal XML shi in react
    note that the HTML strings have escape letters in them


    filters stored in sessionStorage =
    {
        subtopics: ["", "",],
        difficutlyLevels: [number, number],
        solvedStatus: "all" or "solved" or "unsolved"
    }
*/

async function getNumberSolvedPerTopic(){
    const rec: Record<string, number> = {};
    await Promise.all(
        Object.entries(topicCodes).map(async ([full_name, code_name]) =>{
            const n = await progressDb.progressTable.where("skill_cd").equals(code_name).count();
            rec[full_name] = n;
        })  
        
    ) 
    return rec;
}

async function getNumberRemainingPerTopic(){
    const rec: Record<string, number> = await getNumberSolvedPerTopic();
    
    await Promise.all(
        Object.entries(topicCodes).map(async ([full_name, code_name]) =>{
            const n = await db.QDB.where("skill_cd").equals(code_name).count();
            rec[full_name] = n - rec[full_name];
        })

    )
    return rec;
}

export {db,handleJSONUpload, getQuestions, getNumberSolvedPerTopic, getNumberRemainingPerTopic}
 
