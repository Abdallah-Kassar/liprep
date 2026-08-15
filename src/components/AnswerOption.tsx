import parse from "html-react-parser"
import "./AnswerOption.css"

export default function AnswerOption({option}){
    return(
        <div className="answer-option">
            <div className="answer-text">
                <div className="option-label">{option.label}</div>
                <div>{parse(option.text)}</div>
            </div>
            <div className="option-label">{option.label}</div>
        </div>
    )
}
/*
    option = {
        label: "a" "b" etc
        text: HTML String, actual content of the option
    }
*/