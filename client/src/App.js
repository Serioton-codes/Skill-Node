import { createContext, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Grid } from "@mui/material"; // Updated MUI import
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

import Welcome, { ErrorPage } from "./component/Welcome";
import Navbar from "./component/Navbar";
import Login from "./component/authentication/Login";
import Logout from "./component/authentication/Logout";
import Signup from "./component/authentication/Signup";
import Home from "./component/Home";
import Applications from "./component/Applications";
import Profile from "./component/Profile";
import CreateJobs from "./component/recruiter/CreateJobs";
import MyJobs from "./component/recruiter/MyJobs";
import JobApplications from "./component/recruiter/JobApplications";
import AcceptedApplicants from "./component/recruiter/AcceptedApplicants";
import RecruiterProfile from "./component/recruiter/Profile";
import MessagePopup from "./modules/MessagePopup";
import isAuth, { userType } from "./modules/isAuth";
import { styled } from "@mui/system"; // New MUI styled approach
import "./index.css"
import HomePage from "./component/homepage";
import FrequentSkillsPage from "./component/Frequent";
import TrendingSkills from "./component/trendingSkills"
import JobRecommendationsPage from "./component/TransitionJobRecommendations";
import SkillRecommendations from "./component/recommendedSkills"
// Using the new styled approach for body instead of makeStyles
const BodyWrapper = styled(Grid)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "98vh",
  paddingTop: "64px",
  boxSizing: "border-box",
  width: "100%",
}));

export const SetPopupContext = createContext();

function App() {
  const [popup, setPopup] = useState({
    open: false,
    severity: "",
    message: "",
  });


  return (
    <>
    {/* <HomePage /> */}
    <BrowserRouter>
      <SetPopupContext.Provider value={setPopup}>
        <Grid container direction="column">
          <Grid item xs>
            <Navbar />
          </Grid>
          <Grid item>
            {/* Body wrapped with the new styled component */}
            <BodyWrapper container item>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/frequently" element={<FrequentSkillsPage />} />
                <Route path="/transition" element={<JobRecommendationsPage />} />
                <Route path="/trending-skills" element={<TrendingSkills />} />
                <Route path="/recommended-skills" element={<SkillRecommendations />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/home" element={<Home />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/profile" element={
                  userType() === "recruiter" ? <RecruiterProfile /> : <Profile />
                } />
                <Route path="/addjob" element={<CreateJobs />} />
                <Route path="/myjobs" element={<MyJobs />} />
                <Route path="/job/applications/:jobId" element={<JobApplications />} />
                <Route path="/employees" element={<AcceptedApplicants />} />
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </BodyWrapper>
          </Grid>
        </Grid>
        <MessagePopup
          open={popup.open}
          setOpen={(status) =>
            setPopup({
              ...popup,
              open: status,
            })
          }
          severity={popup.severity}
          message={popup.message}
        />
      </SetPopupContext.Provider>
    </BrowserRouter>
    </>
  );
}

export default App;
