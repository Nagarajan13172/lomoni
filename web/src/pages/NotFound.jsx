import { Link } from "react-router-dom";
import { Arrow } from "../components/ui";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="stripes-motif h-2 w-40 rounded-full" />
      <h1 className="display-xl mt-8 text-coral">404</h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">
        This page took a different road. Let's get you back to the start of your design journey.
      </p>
      <Link to="/" className="btn btn-primary mt-8">
        Back home <Arrow />
      </Link>
    </section>
  );
}
