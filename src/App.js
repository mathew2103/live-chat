
import logo from './logo.svg';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState } from 'react';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: "live-chat-app-47295.firebaseapp.com",
  projectId: "live-chat-app-47295",
  storageBucket: "live-chat-app-47295.appspot.com",
  messagingSenderId: process.env.REACT_APP_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: "G-HDLHXXNFSF"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <p className='header-name'>Welcome {user?.displayName}</p>
        <div className='header-signout'>
          <img src={user?.photoURL} className='header-pic' />
          <SignOut />
        </div>
      </header>

      <div className='default-bg'></div>
      <section className={user ? "chat-room-section" : "sign-in-section"}>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div >
  );
}

function SignIn() {
  const signInGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className='sign-in-div'>
      <button onClick={signInGoogle} className='sign-in-button'> Sign in with Google </button >
    </div>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}



function ChatRoom() {

  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    if (formValue == "") return;
    await messagesRef.add({
      uid,
      photoURL,
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })

    setFormValue('')
  }

  return (
    <>
      <div class="message-area">
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </div>


      <form onSubmit={sendMessage} className='send-form'>
        <input className='send-box' value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='Message' />
        <button type='submit' className='submit-button'>➡️</button>
      </form>
    </>

  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (messageClass == 'sent' ?
    <div className={`message ${messageClass}`}>
      <p className='chat-text'>{text}</p>
      <div className='chat-pic-div'>
        <img src={photoURL} className='chat-pic' />
      </div>


    </div>
    :
    <div className={`message ${messageClass}`}>
      <div className='chat-pic-div'>
        <img src={photoURL} className='chat-pic' />
      </div>

      <p className='chat-text'>{text}</p>
    </div>

  )
}

export default App;
