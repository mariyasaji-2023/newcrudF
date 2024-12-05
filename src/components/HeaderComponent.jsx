import React from "react";
import { Link } from "react-router-dom";
import logo from "/images/logo3.webp"

const Header = () => {
  return(
    <div className="flex justify-between lg:py-4 lg:px-10 top-0 bg-white min-w-screen-sm">
      <div className="flex justify-evenly items-center text-2xl font-bold ">
        <div>
          <a href=""><img className="w-16" src={logo} alt="" /></a>
        </div>
        <div className="ml-2 lg:ml-6 lg:text-3xl">
          <h1><Link to='/'>HungrX</Link></h1>
        </div>
        {/* <div className="mx-8 hover:underline hover:text-green-400">
          <a href="">Home</a>
        </div> */}
        <div className="lg:ml-8 ml-2 hover:underline">
          <Link to='/Restaurants'>Restaurants</Link>
        
        </div>
      </div>
    </div>
  )
}

export default Header;