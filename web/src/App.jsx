import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import RoadToDSchool from "./pages/RoadToDSchool";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import WhoWeAre from "./pages/WhoWeAre";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Code-split the 3D pose studio: three.js only loads when you open /studio.
const PoseStudio = lazy(() => import("./pages/PoseStudio"));
import VariationsIndex from "./variations/VariationsIndex";
import V1 from "./variations/V1";
import V2 from "./variations/V2";
import V3 from "./variations/V3";
import V4 from "./variations/V4";

export default function App() {
  return (
    <Routes>
      {/* Design variations — full-bleed, each its own design world */}
      <Route path="/variations" element={<VariationsIndex />} />
      <Route path="/v1" element={<V1 />} />
      <Route path="/v2" element={<V2 />} />
      <Route path="/v3" element={<V3 />} />
      <Route path="/v4" element={<V4 />} />

      {/* Main route-based site */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="r-2-d" element={<RoadToDSchool />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route
          path="studio"
          element={
            <Suspense fallback={<div className="min-h-[60vh]" />}>
              <PoseStudio />
            </Suspense>
          }
        />
        <Route path="who-we-are" element={<WhoWeAre />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
