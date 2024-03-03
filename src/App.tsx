import React, { useState } from 'react';
import style from './App.module.css';
import Main from './components/main/index'
import History from './components/history/index'

function App() {

  const [ActivePage , SetActivePage] = useState(false);

  return (
    <div className={style.App}> 
      <main className={style.main_container}>
      <div className={style.header}>
      <h1 className={style.header_title}>Unsplash API Gallery</h1>
      <div className={style.button_container}>
      <button className={style.header_button} onClick={() => SetActivePage(false)} >Main Page</button>
      <button className={style.header_button} onClick={() => SetActivePage(true)} >History</button>
      </div>
      </div> 
      {ActivePage === true ? <History/> : <Main/>} 
      {/* არ გამოვიყენე React Router, რადგან მხოლოდ 2 მინი გვერდი იყო, რისთვისაც ვამჯობინე უბრალოდ Usestate - ით და კომპონენტის მეშვეობით გადართვა. */}
      </main>
    </div>
  );
}

export default App;
