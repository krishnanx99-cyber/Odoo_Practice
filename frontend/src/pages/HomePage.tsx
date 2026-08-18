import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { EmptyState, Input, Tab } from "../components/ui";
import EventsView from "../components/events/EventsView";

type HomeView = "events" | "resources";

function HomePage() {
  const { user } = useAuth();
  const [view, setView] = useState<HomeView>("events");
  const [search, setSearch] = useState("");

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-12">
      <section className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-headline text-[28px] font-extrabold uppercase leading-tight tracking-tight text-on-background md:text-5xl">
          Welcome, {firstName} 👋
        </h1>
        <p className="text-lg text-on-surface-variant">
          Find events to join and resources to book around campus. Stay connected and make the most
          of your university experience.
        </p>
      </section>

      <section className="flex w-full flex-col items-start justify-between gap-6 border-b-2 border-on-background pb-4 md:flex-row md:items-center">
        <div className="flex gap-4">
          <Tab active={view === "events"} onClick={() => setView("events")}>
            Events
          </Tab>
          <Tab active={view === "resources"} onClick={() => setView("resources")}>
            Resources
          </Tab>
        </div>
        <Input
          type="search"
          name="home-search"
          aria-label={view === "events" ? "Search events" : "Search resources"}
          placeholder={
            view === "events" ? "Search events, clubs..." : "Search resources, facilities..."
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full md:w-96"
        />
      </section>

      <section aria-live="polite">
        {view === "events" ? (
          <EventsView search={search} />
        ) : (
          <EmptyState
            title="No resources found."
            description="Bookable resources will appear here."
          />
        )}
      </section>
    </div>
  );
}

export default HomePage;