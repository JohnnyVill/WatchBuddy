import { useState, type FormEvent } from "react";

type SignupModalProps = {
  visible: boolean;
  onClose: () => void;
  onSignup: () => void;
};

export default function SignupModal({ visible, onClose, onSignup }: SignupModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  if (!visible) {
    return null;
  }
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let errorMap= new Map<number, string>([
      [400, "Missing username or password."],
      [409, "Username is already taken."],
      [500, "Signup failed."]
    ]);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorDate = await response.json();
        setPassword("");
        setSignupError(
        errorMap.get(response.status) || errorDate.message || "An unexpected error occurred. Please try again."
        );
        return;
      }

      // const data = await response.json();
      setSignupError("");
      setUsername("");
      setPassword("");
      onSignup();
    } catch (error:any) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        <form onSubmit={handleSubmit}>
          {signupError ? (
            <div className="mb-4 text-sm text-red-400">{signupError}</div>
          ) : null}
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            required
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 p-2 rounded">
            Signup
          </button>
        </form>
        <button type="button" onClick={onClose} className="mt-4 text-gray-400">
          Close
        </button>
      </div>
    </div>
  );
}