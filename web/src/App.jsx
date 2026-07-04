import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import RoadToDSchool from "./pages/RoadToDSchool";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import WhoWeAre from "./pages/WhoWeAre";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Playground from "./pages/Playground";

// Code-split the 3D tools: three.js only loads when you open a /playground tool.
const PoseStudio = lazy(() => import("./pages/PoseStudio"));
const Build = lazy(() => import("./pages/Build"));
const Shapes = lazy(() => import("./pages/Shapes"));

// Tool fallback fills the playground's main area while three.js loads.
const toolFallback = <div className="h-full w-full" />;
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

        {/* Playground — one menu item, a permanent left sidebar switches tools */}
        <Route path="playground" element={<Playground />}>
          <Route index element={<Navigate to="/playground/studio" replace />} />
          <Route
            path="studio"
            element={<Suspense fallback={toolFallback}><PoseStudio /></Suspense>}
          />
          <Route
            path="build"
            element={<Suspense fallback={toolFallback}><Build /></Suspense>}
          />
          <Route
            path="shapes"
            element={<Suspense fallback={toolFallback}><Shapes /></Suspense>}
          />
        </Route>
        {/* Legacy links → new playground paths */}
        <Route path="studio" element={<Navigate to="/playground/studio" replace />} />
        <Route path="build" element={<Navigate to="/playground/build" replace />} />
        <Route path="shapes" element={<Navigate to="/playground/shapes" replace />} />

        <Route path="who-we-are" element={<WhoWeAre />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
