import type { FormEvent } from "react";

type SignupModalProps = {
  visible: boolean;
  onClose: () => void;
  onSignup: () => void;
};

export default function SignupModal({ visible, onClose, onSignup }: SignupModalProps) {
  if (!visible) {
    return null;
  }
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    // console.log("Submitting signup data:", { username, password });
    try{
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }
      onSignup();
      console.log("Signup response:", response);
    }catch(error){
      console.error("Signup failed:", error);
    }
    
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="username"
            placeholder="Username"
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
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