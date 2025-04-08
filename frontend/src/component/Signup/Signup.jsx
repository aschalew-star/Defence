import React,{useState,} from "react";
import { CgProfile } from "react-icons/cg";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

function Signup() {

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const handleFileInputChange = (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatar(reader.result);
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:5000/user/signup", { name, email, password, avatar })
      .then((res) => {
        toast.success("Register seccessfull");
        setName("");
        setEmail("");
        setPassword("");
        setAvatar(null);
        console.log(res.data.success);
        console.log("Register seccessfull");
          
      
      })
      .catch((error) => {
        console.log(error);
        toast.success("Register Error");
        console.log(error.response.data.message);

      });
  };
  return (
    <div className="">
      <div className="flex flex-col  mt-0 justify-center items-center mx-auto w-full md:w-[360px] pr-5 pl-5 pt-0 shadow-lg pb-1 rounded-lg">
        <div className="text-[30px] font-bold pb-4 text-black" >
          Register TO MEP
        </div>
        <div className="w-full">
          <form className="flex flex-col " onSubmit={handleSubmit}>
            <div className="flex flex-col mb-2">
              <label htmlFor="">name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-400   h-7 rounded-md pl-3 focus:outline-blue-500 focus:ring-1 focus:ring-blue-400"
                placeholder="your email"
              />
            </div>
            <div className="flex flex-col mb-2">
              <label htmlFor="">email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-400   h-7 rounded-md pl-3 focus:outline-blue-500 focus:ring-1 focus:ring-blue-400"
                placeholder="your email"
              />
            </div>
            <div className="flex flex-col mb-2">
              <label htmlFor="">password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-400  h-7 rounded-md pl-3 focus:outline-blue-500 focus:ring-1 focus:ring-blue-400"
                placeholder="your password"
              />
            </div>
            <div className="flex flex-row items-end mb-4 mt-3">
              <CgProfile className="  size-9" />
              <input type="file" className=""
               name="avatar"
               id="file-input"
               accept=".jpg,.jpeg,.png"
               onChange={handleFileInputChange}
                />
            </div>
            <div className="flex flex-col mb-4 mt-5">
              <button
                type="submit"
                className="border bg-blue-600 h-7 rounded-md text-white"
                placeholder="your password"
              >Submit</button>
            </div>
            <div className="flex mb-8 mr-10 justify-end">
              <p>if you have account</p>
              <Link to={"/login"}>
              <button className="bg-blue-600 ml-10 px-4 rounded-md text-white py-1">
                Login
              </button>
              </Link>
             
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
