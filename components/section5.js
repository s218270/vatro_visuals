"use client";
import { useState } from 'react';

export default function Section5() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch("https://formspree.io/f/mpwpabqg", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.get('email'),
          message: formData.get('message') // Only include fields that exist in the form
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true);
        e.target.reset();
      } else {
        setError(data.error || 'Wystąpił błąd podczas wysyłania formularza');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setError('Wystąpił błąd połączenia');
    }
  };

  return (
    <section
      id="section5"
      className="h-screen w-full bg-black flex flex-col items-center justify-center relative"
    >
      <h1 className="text-white text-4xl mb-8">Kontakt</h1>
      
      {isSubmitted ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          Wiadomość wysłana pomyślnie!
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col gap-4"
        >
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Email field remains the same */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Twój email"
              required
            />
          </div>

          {/* <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Temat
            </label>
            <input
              type="text"
              id="title"
              name="subject" // Changed name to "subject"
              className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Temat wiadomości"
              required
            />
          </div> */}

          {/* Message field remains the same */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Wiadomość
            </label>
            <textarea
              id="message"
              name="message"
              className="mt-1 p-2 block w-full rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Treść wiadomości"
              rows="4"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Wyślij
          </button>
        </form>
      )}

      {/* Social media icons remain the same */}
      <a href="#" className="hover:scale-110 transform transition">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg"
            alt="Facebook"
            className="w-10 h-10"
          />
        </a>
        <a href="#" className="hover:scale-110 transform transition">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
            alt="Instagram"
            className="w-10 h-10"
          />
        </a>
        <a href="#" className="hover:scale-110 transform transition">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png"
            alt="YouTube"
            className="w-10 h-10"
          />
        </a>
    </section>
  );
}