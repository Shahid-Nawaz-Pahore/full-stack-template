"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios"; // Import Axios

const Register = () => {
  const [error, setError] = useState("");
  const [userType, setUserType] = useState("");
  const [voucherCategory, setVoucherCategory] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [formFields, setFormFields] = useState({
    name: "",
    email: "",
    cnic: "",
    password: "",
    confirmPassword: "",
    serviceProviderName: "",
    city: "",
    country: "",
  });

  const router = useRouter();

  const handleInputChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, index) => {
    if (e.target.files) {
      const newDocuments = [...documents];
      newDocuments[index] = e.target.files[0];
      setDocuments(newDocuments);
    }
  };

  const addDocumentField = () => setDocuments([...documents, null]);
  const deleteDocumentField = (index) => setDocuments(documents.filter((_, i) => i !== index));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formFields.password !== formFields.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions.");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(formFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("userType", userType);
      formData.append("voucherCategory", voucherCategory);
      documents.forEach((doc) => {
        if (doc) formData.append("documents", doc); // Append each document
      });

      const response = await axios.post("http://localhost:5000/api/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Specify that you're sending form data
        },
      });

      if (response.status === 201) {
        router.push("/afterRegister");
      } else {
        setError("Failed to register.");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center m-4">
      <Card className="bg-gray-300/10">
        {error && <div className="text-2xl text-red-500">{error}</div>}
        <h1 className="text-3xl my-3 text-blue-950 font-bold flex gap-3 justify-center items-center">
          Register
        </h1>
        <form onSubmit={handleSubmit} className="my-5 flex flex-col items-center justify-center p-5 shadow-lg rounded-md">
          <div className="my-2">
            <label htmlFor="userType">User Type:</label>
            <select
              name="userType"
              id="userType"
              className="my-2 mx-1 border-gray-500 rounded"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="beneficiary">Beneficiary</option>
              <option value="serviceProvider">Service Provider</option>
            </select>
          </div>

          {["name", "email", "cnic", "password", "confirmPassword"].map((field) => (
            <div className="my-2" key={field}>
              <label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              <Input
                type={field.includes("password") ? "password" : field === "cnic" ? "number" : "text"}
                name={field}
                id={field}
                className="my-2 mx-1 border-gray-500 rounded"
                value={formFields[field]}
                onChange={handleInputChange}
                required
              />
            </div>
          ))}

          <div className="my-2">
            <label htmlFor="voucherCategory">Voucher Category:</label>
            <select
              name="voucherCategory"
              id="voucherCategory"
              className="my-2 mx-1 border-gray-500 rounded"
              value={voucherCategory}
              onChange={(e) => setVoucherCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
            </select>
          </div>

          {voucherCategory === "Education" && userType === "beneficiary" && (
            <>
              <div className="my-2">
                <label htmlFor="cgpa">CGPA:</label>
                <Input
                  type="text"
                  name="cgpa"
                  id="cgpa"
                  className="my-2 mx-1 border-gray-500 rounded"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="my-2">
                <label htmlFor="universityName">University Name:</label>
                <Input
                  type="text"
                  name="universityName"
                  id="universityName"
                  className="my-2 mx-1 border-gray-500 rounded"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}

          {userType === "serviceProvider" && (
            <>
              {["serviceProviderName", "city", "country"].map((field) => (
                <div className="my-2" key={field}>
                  <label htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                  </label>
                  <Input
                    type="text"
                    name={field}
                    id={field}
                    className="my-2 mx-1 border-gray-500 rounded"
                    value={formFields[field]}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              ))}
            </>
          )}

          {(voucherCategory === "Education" || voucherCategory === "Healthcare" || userType === "serviceProvider") && (
            <div className="my-4">
              {documents.map((_, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, index)}
                    required
                  />
                  <Button
                    type="button"
                    onClick={() => deleteDocumentField(index)}
                    className="ml-2"
                  >
                    Delete
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={addDocumentField}
                className="mt-2"
              >
                Add Document
              </Button>
            </div>
          )}

          <div className="my-2 flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              required
            />
            <label htmlFor="terms" className="ml-2">
              I accept the terms and conditions.
            </label>
          </div>

          <Button
            type="submit"
            className="w-md text-white rounded-lg text-lg hover:bg-blue-500"
          >
            Register
          </Button>
        </form>
      </Card>
      <p className="my-3">
        Already have an account?{" "}
        <Link href="/" className="text-blue-600 underline ml-2">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
