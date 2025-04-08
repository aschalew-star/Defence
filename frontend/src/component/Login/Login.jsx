import axios from "axios";
import React,{useState} from "react";
import { Link ,useNavigate} from "react-router-dom";
import { toast } from "react-toastify";

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios
      .post(
        "http://localhost:5000/user/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      )
      .then((res) => {
        console.log(res.data.success);
        toast.success("Login Success!");
        navigate("/");
        window.location.reload(true); 
      })
      .catch((err) => {
        toast.error("Login Error!");
      });
  };
  
  return (
    <div className="">
      <div className="flex flex-col mt-15 mt-20 justify-center items-center mx-auto w-[350px] pr-5 pl-5 pt-2 shadow-lg pb-1 rounded-lg">
        <div className="text-[30px] font-bold pb-5 text-black">
          LOGIN TO MEP
        </div>
        <div className="w-full">
          <form className="flex flex-col " onSubmit={handleSubmit}>
  
            <div className="flex flex-col mb-5">
              <label htmlFor="">email</label>
              <input
                type="email"
                className="border border-gray-400  h-7 rounded-md pl-3"
                placeholder="your email"
                value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-5">
              <label htmlFor="">password</label>
              <input
                type="text"
                className="border border-gray-400  h-7 rounded-md pl-3"
                placeholder="your password"
                value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col mb-5 mt-5">
              <input
                type="submit"
                className="border bg-blue-600 h-9 rounded-md text-white"
                placeholder="your password"
              />
            </div>
            <div className="flex mb-8 mr-10 justify-end">
              <p>if you not account</p>
              <Link to={"/signup"}>
              <button className="bg-blue-600 ml-10 px-4 rounded-md text-white py-1">
                Signup
              </button>
              </Link>
             
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
