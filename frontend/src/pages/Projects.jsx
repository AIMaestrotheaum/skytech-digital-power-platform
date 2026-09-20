import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const projects = [
  {
    title: "500kVA UPS Array | Lithium-ion Bank",
    category: "DATA CENTER",
    location: "PUNE, INDIA",
    description:
      "High-capacity UPS infrastructure engineered for continuous industrial and enterprise operations.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80",
    featured: true,
  },
  {
    title: "Heavy Machinery Voltage Stabilization",
    category: "AUTOMOTIVE",
    location: "PUNE, INDIA",
    description:
      "Custom voltage stabilization implementation designed for automated industrial machinery and assembly operations.",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Critical Care Backup Power",
    category: "HEALTHCARE",
    location: "PUNE, INDIA",
    description:
      "Reliable backup power infrastructure designed to support critical healthcare operations.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Industrial Power Distribution",
    category: "INDUSTRIAL",
    location: "MAHARASHTRA, INDIA",
    description:
      "Electrical infrastructure designed for demanding industrial loads and continuous operations.",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Commercial UPS Installation",
    category: "COMMERCIAL",
    location: "PUNE, INDIA",
    description:
      "Complete UPS installation and commissioning for commercial facilities requiring dependable power continuity.",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
  },
];

const filters = [
  "ALL",
  "UPS",
  "INSTALLATION",
  "BATTERY BANK",
  "STABILIZER",
  "AMC",
  "INDUSTRIAL",
];

export default function Projects() {
  const [activeFilter, setActiveFilter] =
    useState("ALL");

  const filteredProjects = useMemo(() => {
    if (activeFilter === "ALL") {
      return projects;
    }

    return projects.filter((project) => {
      const category =
        project.category?.toUpperCase() || "";

      const title =
        project.title?.toUpperCase() || "";

      if (activeFilter === "UPS") {
        return (
          category.includes("UPS") ||
          title.includes("UPS")
        );
      }

      if (activeFilter === "INSTALLATION") {
        return (
          category.includes("INSTALLATION") ||
          title.includes("INSTALLATION")
        );
      }

      if (activeFilter === "BATTERY BANK") {
        return (
          category.includes("BATTERY") ||
          title.includes("BATTERY")
        );
      }

      if (activeFilter === "STABILIZER") {
        return (
          category.includes("STABILIZATION") ||
          category.includes("STABILIZER") ||
          title.includes("STABILIZATION") ||
          title.includes("STABILIZER")
        );
      }

      if (activeFilter === "AMC") {
        return (
          category.includes("AMC") ||
          title.includes("AMC")
        );
      }

      if (activeFilter === "INDUSTRIAL") {
        return (
          category.includes("INDUSTRIAL") ||
          title.includes("INDUSTRIAL")
        );
      }

      return true;
    });
  }, [activeFilter]);

  const featuredProject =
    projects.find(
      (project) => project.featured
    ) || projects[0];

  const gridProjects = filteredProjects.filter(
    (project) => !project.featured
  );

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-[#c5c6cd] bg-[#f7f9fb]">
        {/* Circuit background */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(#c5c6cd 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-16 md:py-20">
          {/* Label */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#d6e3ff] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#0050cc]" />

            <span className="font-mono text-xs font-medium tracking-[0.12em] text-[#0d1c32]">
              PROJECT PORTFOLIO
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl font-[Manrope] text-4xl font-extrabold leading-[1.1] tracking-tight text-[#000] md:text-6xl">
            Engineered Solutions.
            <br />
            <span className="text-[#0050cc]">
              Proven Results.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-3xl font-[Inter] text-lg leading-8 text-[#44474d]">
            Explore our portfolio of high-performance
            electrical infrastructure projects,
            demonstrating structural integrity,
            engineering precision and reliable power
            solutions across different industries.
          </p>
        </div>
      </section>

      {/* =====================================================
          PROJECT FILTERS
      ====================================================== */}
      <section className="border-b border-[#c5c6cd] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-16">
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setActiveFilter(filter)
                }
                aria-pressed={
                  activeFilter === filter
                }
                className={`rounded border px-4 py-2 font-mono text-xs font-medium tracking-wider transition-all duration-200 ${
                  activeFilter === filter
                    ? "border-[#0050cc] bg-[#0050cc] text-white"
                    : "border-[#c5c6cd] bg-white text-[#44474d] hover:border-[#0050cc] hover:text-[#0050cc]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          PROJECTS
      ====================================================== */}
      <section className="px-4 py-16 md:px-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          {/* Section heading */}
          <div className="mb-10">
            <p className="font-mono text-xs font-medium tracking-[0.12em] text-[#0050cc]">
              SELECTED PROJECTS
            </p>

            <h2 className="mt-3 font-[Manrope] text-3xl font-bold tracking-tight text-[#000] md:text-4xl">
              Built for Critical Operations
            </h2>

            {activeFilter !== "ALL" && (
              <p className="mt-3 text-sm text-[#75777e]">
                Showing projects for:{" "}
                <span className="font-semibold text-[#0050cc]">
                  {activeFilter}
                </span>
              </p>
            )}
          </div>

          {/* =================================================
              FEATURED PROJECT
          ================================================== */}
          {activeFilter === "ALL" && (
            <article className="group mb-6 overflow-hidden rounded-lg border border-[#c5c6cd] bg-white transition-all duration-300 hover:border-[#0050cc] hover:shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image */}
                <div className="relative h-[350px] overflow-hidden md:h-[450px]">
                  <img
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c32]/80 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 p-6 text-white md:p-8">
                    <p className="mb-2 font-mono text-xs tracking-[0.15em] opacity-80">
                      FEATURED PROJECT
                    </p>

                    <p className="font-mono text-xs tracking-[0.15em] text-[#b4ebff]">
                      {featuredProject.category}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-7 md:p-10">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d6e3ff] text-xl text-[#0050cc]">
                      ⚡
                    </span>

                    <span className="font-mono text-xs font-medium tracking-[0.12em] text-[#0050cc]">
                      DATA CENTER
                    </span>
                  </div>

                  <h3 className="font-[Manrope] text-3xl font-bold leading-tight text-[#000] md:text-4xl">
                    {featuredProject.title}
                  </h3>

                  <p className="mt-5 leading-8 text-[#44474d]">
                    {featuredProject.description}
                  </p>

                  {/* Project information */}
                  <div className="mt-7 grid grid-cols-2 gap-4 border-y border-[#e0e3e5] py-5">
                    <div>
                      <p className="font-mono text-[11px] tracking-widest text-[#75777e]">
                        LOCATION
                      </p>

                      <p className="mt-1 font-semibold text-[#0d1c32]">
                        {featuredProject.location}
                      </p>
                    </div>

                    <div>
                      <p className="font-mono text-[11px] tracking-widest text-[#75777e]">
                        APPLICATION
                      </p>

                      <p className="mt-1 font-semibold text-[#0d1c32]">
                        Critical Power
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/project-gallery"
                    className="mt-7 inline-flex w-fit items-center gap-2 rounded border border-[#0050cc] px-5 py-3 font-semibold text-[#0050cc] transition-all hover:bg-[#0050cc] hover:text-white"
                  >
                    View Project Gallery
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* =================================================
              FILTERED / PROJECT GRID
          ================================================== */}
          {gridProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {gridProjects.map((project) => (
                <article
                  key={project.title}
                  className="group overflow-hidden rounded-lg border border-[#c5c6cd] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#0050cc] hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative h-[280px] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c32]/90 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <p className="mb-2 font-mono text-xs tracking-[0.15em] text-[#b4ebff]">
                        {project.category}
                      </p>

                      <h3 className="font-[Manrope] text-2xl font-bold">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="leading-7 text-[#44474d]">
                      {project.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#e0e3e5] pt-4">
                      <span className="font-mono text-xs text-[#75777e]">
                        📍 {project.location}
                      </span>

                      <Link
                        to="/project-gallery"
                        className="font-semibold text-[#0050cc] hover:underline"
                      >
                        View Project →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#c5c6cd] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#d6e3ff] text-2xl text-[#0050cc]">
                ⚡
              </div>

              <h3 className="mt-5 font-[Manrope] text-2xl font-bold text-[#000]">
                No Projects Found
              </h3>

              <p className="mx-auto mt-3 max-w-lg leading-7 text-[#44474d]">
                There are currently no projects matching
                the selected category.
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveFilter("ALL")
                }
                className="mt-6 rounded bg-[#0050cc] px-6 py-3 font-semibold text-white transition hover:bg-[#003b99]"
              >
                View All Projects
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          AMC SECTION
      ====================================================== */}
      <section className="border-y border-[#c5c6cd] bg-[#f2f4f6] px-4 py-16 md:px-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-[#c5c6cd] bg-white lg:grid-cols-3">
            {/* Left */}
            <div className="relative h-[300px] lg:h-[380px]">
              <img
                src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=80"
                alt="Industrial electrical equipment"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1c32]/70 to-transparent" />

              <div className="absolute bottom-5 left-5">
                <p className="font-mono text-xs tracking-widest text-[#b4ebff]">
                  SERVICE
                </p>

                <p className="mt-1 font-[Manrope] text-xl font-bold text-white">
                  Preventive Maintenance
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col justify-center p-8 lg:col-span-2 lg:p-10">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl text-[#0050cc]">
                  ⚙
                </span>

                <span className="font-mono text-xs font-bold tracking-[0.15em] text-[#0050cc]">
                  ONGOING AMC
                </span>
              </div>

              <h2 className="font-[Manrope] text-2xl font-bold text-[#000] md:text-3xl">
                Comprehensive Power Maintenance for Tech Park
              </h2>

              <p className="mt-4 max-w-3xl leading-8 text-[#44474d]">
                Managing installed UPS capacity across a large technology
                campus with preventive maintenance, monitoring and dedicated
                service support to help maintain reliable power continuity.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-5 border-y border-[#e0e3e5] py-5 md:grid-cols-3">
                <div>
                  <p className="font-mono text-[11px] tracking-widest text-[#75777e]">
                    SERVICE
                  </p>

                  <p className="mt-1 font-semibold">
                    AMC
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] tracking-widest text-[#75777e]">
                    SUPPORT
                  </p>

                  <p className="mt-1 font-semibold">
                    24/7
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] tracking-widest text-[#75777e]">
                    MONITORING
                  </p>

                  <p className="mt-1 font-semibold">
                    Predictive
                  </p>
                </div>
              </div>

              <Link
                to="/services"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded bg-[#0050cc] px-6 py-3 font-semibold text-white transition hover:bg-[#003b99]"
              >
                Explore Service Solutions
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="px-4 py-16 md:px-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-lg bg-[#0d1c32] p-8 text-white md:p-12">
            {/* Pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(#b4ebff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
              <div>
                <p className="font-mono text-xs tracking-[0.15em] text-[#b4ebff]">
                  START YOUR PROJECT
                </p>

                <h2 className="mt-3 max-w-2xl font-[Manrope] text-3xl font-bold leading-tight md:text-4xl">
                  Need a Custom Power Solution?
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-[#d8dadc]">
                  Talk directly with our engineering team to design
                  infrastructure that meets your exact load and uptime
                  requirements.
                </p>
              </div>

              <div className="md:text-right">
                <Link
                  to="/quote"
                  className="inline-flex items-center gap-2 rounded bg-[#0050cc] px-7 py-3 font-semibold text-white transition hover:bg-[#0266ff]"
                >
                  Talk to an Expert
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}