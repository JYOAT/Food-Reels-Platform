import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserRegister from "../pages/auth/UserRegister";
import UserLogin from "../pages/auth/UserLogin";
import FoodPartnerRegister from "../pages/auth/FoodPartnerRegister";
import FoodPartnerLogin from "../pages/auth/FoodPartnerLogin";
import ChooseRegister from "../pages/auth/ChooseRegister";
import Home from "../pages/general/Home";
import CreateFood from "../pages/food-partner/CreateFood";
import Profile from "../pages/food-partner/Profile";
import BottomNav from "../components/BottomNav";
import Saved from "../pages/general/Saved";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<ChooseRegister />} />
        <Route
          path="/user/register"
          element={<UserRegister></UserRegister>}
        ></Route>
        <Route path="/user/login" element={<UserLogin></UserLogin>}></Route>
        <Route
          path="/food-partner/register"
          element={<FoodPartnerRegister></FoodPartnerRegister>}
        ></Route>
        <Route
          path="/food-partner/login"
          element={<FoodPartnerLogin></FoodPartnerLogin>}
        ></Route>
        <Route path="/create-food" element={<CreateFood></CreateFood>}></Route>
        <Route path="/food-partner/:id" element={<Profile></Profile>} />
        <Route
          path="/"
          element={
            <>
              <Home />
              <BottomNav />
            </>
          }
        />
        <Route
          path="/saved"
          element={
            <>
              <Saved />
              <BottomNav />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
