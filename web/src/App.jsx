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

// The design variations (/variations, /v1–/v4) are not part of the public
// site. Their components still live in src/variations/ — unrouted, so they
// are no longer bundled — and can be wired back up when needed.

export default function App() {
  return (
    <Routes>
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
