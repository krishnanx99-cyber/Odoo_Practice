function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 max-w-3xl">
        <h1 className="font-headline text-[28px] font-extrabold uppercase leading-tight tracking-tight text-on-background md:text-5xl">
          Welcome to CampusConnect
        </h1>
        <p className="text-lg text-on-surface-variant">
          Find events to join and resources to book around campus. Stay
          connected and make the most of your university experience.
        </p>
      </section>
    </div>
  );
}

export default HomePage;