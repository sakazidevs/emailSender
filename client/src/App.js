import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaTwitter, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';
import LOGO from './mylogo.png';

function Header() {
  return (
    <header className="header">
      <img className="logo" src={LOGO} alt="Sakazi Devs" />
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer-text">
        Powered by 
         <a href="https://sakazidevs.com">
          Sakazidevs
        </a>
        &copy; {currentYear}
      </div>
      <div className="social-icons">
        <a href='https://twitter.com/sakazi_devs'><FaTwitter /></a>
        <a href='https://facebook.com/sakazidevs'><FaFacebook /></a>
        <a href='https://www.instagram.com/sakazidevs?igsh=cTBuZWttYTJiaWNm'><FaInstagram /></a>
        <a href='https://github.com/sakazidevs'><FaGithub /></a>
      </div>
    </footer>
  );
}

const modules = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ 'size': [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video', 'color', 'background'
];

function App() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.focus();
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
  
      axios.post('http://localhost:4000/upload-image', formData)
        .then(response => {
          const imageUrl = response.data.imageUrl;
          const range = quillRef.current.getEditor().getSelection();
          quillRef.current.getEditor().insertEmbed(range ? range.index : 0, 'image', imageUrl);
        })
        .catch(error => {
          console.error('Error uploading image:', error);
          toast.error('Error uploading image');
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    formData.append('file', file);

    axios.post('http://localhost:4000/send-email', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(response => {
        console.log(response.data);
        toast.success(response.data);
        setTitle('');
        setMessage('');
        setFile(null);
      })
      .catch(error => {
        console.error('Error sending email:', error);
        toast.error('Error sending email');
      });
  };

  return (
    <div className="app">
      <Header />
      <div className="content">
        <h1>Sakazidevs <span>emailSender</span></h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Topic:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label>What do you have to say?</label>
            <ReactQuill
              ref={quillRef}
              value={message}
              onChange={setMessage}
              modules={modules}
              formats={formats}
              placeholder="Compose your message..."
            />
          </div>
          <div>
            <label>Attach your files here:</label>
            <input type="file" accept="image/*, application/pdf, .doc, .docx, .txt" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <button type="submit">Send Email</button>
        </form>
        <ToastContainer />
      </div>
      <Footer />
    </div>
  );
}

export default App;
