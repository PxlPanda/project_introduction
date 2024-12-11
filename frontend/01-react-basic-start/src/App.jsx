import Header from "./components/Header"
import TeachingSection from "./components/TeachingSection"
import ButtonsSection from "./components/ButtonsSection"
import { Fragment, useState } from "react"
import TabsSection from "./components/TabsSection"
import FeedbackSection from "./components/FeedbackSection"
import axios from "axios"
import GetJWT from "./components/JWT"
import RegisterSection from "./components/RegisterSection"

export default function App() {
  const [tab, setTab] = useState("main")
  return (
    <Fragment>
      <Header />
      <main>
        {/* <GetJWT /> */}
        <TabsSection active = {tab} onChange={(current) => setTab(current)}/>

        {tab == "main" &&
        (<>
        <TeachingSection /> 
        <ButtonsSection />
        <RegisterSection />
        </>)}

        {tab == "feedback" &&
        (<FeedbackSection />
        )}

        {tab == "register" &&
        (<><RegisterSection /></>)}

        {tab == "login" &&
        (<LoginSection />)}
        {/* {tab == "main" ?
        (<>
        <TeachingSection /> 
        <ButtonsSection />
        </>) :
        (<FeedbackSection />
        )} */}
        </main>
    </Fragment>
  )
}

// function logIn(){
//   cookies.set(jwt_token, {
//     expires: new Date (100 * 1000),
//   })
// }


//https://www.gosuslugi.ru/life/details/sign_up_volunteer