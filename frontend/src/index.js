import React from "react"
import * as ReactDOMClient from "react-dom/client"


class Header extends React.Component{
  reneder(){
    return (
    <h>Хэхэй, я пидорас</h>
  )}
}


class App extends React.Component{
  helpText = "Help text!"

  greetings = "Привет, мудень!"

  inputClick(){
      console.log("Mouse Clicked")
  }


  mouseOver(){
      console.log("Mouse Over")
  }
  render()
  {return (<div className = "name">
    <Header/>
      <h1>{this.helpText}</h1>
      <input placeholder = {this.helpText}
      onClick = {this.inputClick} onMouseEnter = {this.mouseOver} />
      </div>)}
}


const app = ReactDOMClient.createRoot(document.getElementById("app"))

app.render(<App/>)