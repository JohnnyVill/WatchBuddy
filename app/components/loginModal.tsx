import type { FormEvent } from "react";
import { useState } from "react";


type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
};

export default function LoginModal({ visible, onClose, onLogin }: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!visible) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }else{
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if(!response.ok){
        const errorData = await response.json();
        alert(errorData.message || "Login failed. Please try again.");
        return;
      }
      // const data = await response.json();
      onLogin();
      setUsername("");
      setPassword("");
      return;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="username"
            placeholder="Username"
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            value={password}
            onChange={(e)=> setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 p-2 rounded">
            Login
          </button>
        </form>
        <button type="button" onClick={onClose} className="mt-4 text-gray-400">
          Close
        </button>
      </div>
    </div>
  );
}
