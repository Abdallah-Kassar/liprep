import { useEffect, useState } from "react";
import "./TopicSelection.css"
import {topicTree} from "./TopicTree"
import { getNumberRemainingPerTopic } from "@/db";

export default function TopicSelection({selected, setSelected, difficulty, solvedStatus}){
    const [recRemainingQuestions, setRecRemainingQuestions] = useState<Record<string, number>>({});

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const temp = await getNumberRemainingPerTopic(difficulty, solvedStatus);

            if (!cancelled) {
                setRecRemainingQuestions(temp);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [difficulty, solvedStatus]);

    function toggleOne(topicName:string){
        const nextSelected = new Set(selected);

        if(nextSelected.has(topicName)){
            nextSelected.delete(topicName);
        }else nextSelected.add(topicName);
        setSelected(nextSelected);
    }

    function toggleGroup(childernTopics:Array<string>){
        const nextSelected = new Set(selected);

        const allSelected = childernTopics.every((topic) => selected.has(topic));
        childernTopics.forEach((childTopic) =>{
            if(allSelected)
                nextSelected.delete(childTopic);
            else 
                nextSelected.add(childTopic);
        })

        setSelected(nextSelected);
    }

    function renderModule(title : string, data :object){
        return(
            <div className="selection-grid-column">
                <h2 className="module-title">{title == "Reading and Writing" ? "EBRW" : "Math"}</h2>
                {Object.entries(data).map(([group, childernTopics]) =>{

                    const checked = childernTopics.every((childTopic:string) => selected.has(childTopic));
                    let questionsRemainingInGroup = 0;
                    childernTopics.forEach((childTopic:string) => questionsRemainingInGroup += recRemainingQuestions[childTopic]);
                    return(
                        <div key={group} className="group-topic">
                            <label className={`parent-checkbox ${checked && "checked"}`}> <span className="remaining-questions">{questionsRemainingInGroup}</span>  {group}
                                <input style={{display:"none"}} type="checkbox" value={checked} onChange={() => toggleGroup(childernTopics)} />
                            </label>
                            <div className="sub-topics">
                                {
                                    childernTopics.map((childTopic :string) =>{
                                        return(
                                            <label className={`child-checkbox ${selected.has(childTopic) && "checked"}`} key={childTopic}>
                                                <span style={{minWidth:"35px"}}>{recRemainingQuestions[childTopic]}</span>  {childTopic}
                                                <input style={{display:"none"}} type="checkbox" checked={selected.has(childTopic)} onChange={() => toggleOne(childTopic)} />
                                            </label>
                                        )
                                    })
                                }
                            </div>

                        </div>

                    )

                })}
            </div>
        )
    }

    return(
        <div>
            <div className="topic-selection-grid">
                {renderModule("Reading and Writing", topicTree.reading)}
                {renderModule("math", topicTree.math)}
            </div>
        </div>
    );
}