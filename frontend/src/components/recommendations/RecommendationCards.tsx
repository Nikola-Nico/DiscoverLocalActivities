import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type WorkingHour = {
  id: number;
  activity_id: number;
  day_of_week: string | null;
  open_time: string | null;
  close_time: string | null;
  break_hour_start: string | null;
  break_hour_end: string | null;
  is_open_24h: boolean;
  is_closed: boolean;
};

type RecommendationCardProps = {
  name: string;
  category: string;
  rating?: number | null;
  phone?: string | null;
  priceLevel?: string;
  distanceKm?: number;
  recommendationScore?: number;
  recommendationReason?: string;
  isOpen?: boolean;
  latitude?: number;
  longitude?: number;
  context?: string;
  userRatingCount?: number;
  workingHours?: WorkingHour[];
};

function formatTime(value: string | null | undefined) {
  return value ?? "n/a";
}

function formatDayLabel(value: string | null | undefined) {
  if (!value) return "Unspecified day";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function RecommendationCard({
  name,
  category,
  rating,
  phone,
  priceLevel,
  distanceKm,
  recommendationScore,
  recommendationReason,
  isOpen,
  latitude,
  longitude,
  context,
  userRatingCount,
  workingHours = [],
}: RecommendationCardProps) {
  const [isOpenDetails, setIsOpenDetails] = useState(false);

  useEffect(() => {
    if (!isOpenDetails) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpenDetails(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpenDetails]);

  const openDetails = () => setIsOpenDetails(true);
  const closeDetails = () => setIsOpenDetails(false);

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDetails();
          }
        }}
        className="group flex cursor-pointer flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-pill focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold leading-tight text-card-foreground">
              {name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{category}</p>
          </div>
          {typeof isOpen === "boolean" && (
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                isOpen
                  ? "bg-gradient-pill text-primary-foreground shadow-pill"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {isOpen ? "Open now" : "Closed"}
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            Rating:{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-card-foreground">
              {typeof rating === "number" ? (
                <>
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {rating.toFixed(1)}
                </>
              ) : (
                "n/a"
              )}
            </span>
          </p>
          {typeof distanceKm === "number" && (
            <p>
              Distance:{" "}
              <span className="font-semibold text-card-foreground">
                {distanceKm.toFixed(2)} km
              </span>
            </p>
          )}
          {typeof recommendationScore === "number" && (
            <p>
              Score:{" "}
              <span className="font-semibold text-card-foreground">
                {`${(recommendationScore * 100).toFixed(0)}%`}
              </span>
            </p>
          )}
          {typeof userRatingCount === "number" && (
            <p>
              Ratings:{" "}
              <span className="font-semibold text-card-foreground">
                {userRatingCount}
              </span>
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Tap for details
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openDetails();
            }}
            className="rounded-full bg-gradient-pill px-5 py-2 text-sm font-semibold text-primary-foreground shadow-pill transition-transform group-hover:scale-105"
          >
            Details
          </button>
        </div>
      </article>

      {isOpenDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-pill">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gradient-hubby">
                  Full details
                </p>
                <h3 className="mt-1 text-3xl font-extrabold tracking-tight text-card-foreground">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category}
                  {context ? ` · ${context}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <StatBox
                    label="Rating"
                    value={
                      typeof rating === "number"
                        ? `★ ${rating.toFixed(1)}`
                        : "n/a"
                    }
                  />
                  <StatBox
                    label="Status"
                    value={
                      typeof isOpen === "boolean"
                        ? isOpen
                          ? "Open now"
                          : "Closed now"
                        : "n/a"
                    }
                  />
                  {typeof distanceKm === "number" && (
                    <StatBox
                      label="Distance"
                      value={`${distanceKm.toFixed(2)} km`}
                    />
                  )}
                  {typeof recommendationScore === "number" && (
                    <StatBox
                      label="Score"
                      value={`${(recommendationScore * 100).toFixed(0)}%`}
                    />
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoBox label="Contact">
                    <Row
                      label="Rating Count"
                      value={userRatingCount?.toString() ?? "n/a"}
                    />
                    <Row label="Phone" value={phone ?? "n/a"} />
                  </InfoBox>
                  <InfoBox label="Location">
                    <Row
                      label="Latitude"
                      value={
                        typeof latitude === "number"
                          ? latitude.toFixed(5)
                          : "n/a"
                      }
                    />
                    <Row
                      label="Longitude"
                      value={
                        typeof longitude === "number"
                          ? longitude.toFixed(5)
                          : "n/a"
                      }
                    />
                  </InfoBox>
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-secondary p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Working hours
                    </p>
                    <h4 className="mt-1 text-lg font-bold text-card-foreground">
                      Weekly schedule
                    </h4>
                  </div>
                  {typeof userRatingCount === "number" && (
                    <div className="rounded-full bg-card px-3 py-1 text-sm font-medium text-card-foreground shadow-card">
                      {userRatingCount} ratings
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {workingHours.length === 0 ? (
                    <div className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-card">
                      No working hours available.
                    </div>
                  ) : (
                    workingHours.map((workingHour) => (
                      <div
                        key={workingHour.id}
                        className="rounded-2xl bg-card p-4 shadow-card"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h5 className="font-semibold text-card-foreground">
                            {formatDayLabel(workingHour.day_of_week)}
                          </h5>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {workingHour.is_closed
                              ? "Closed all day"
                              : workingHour.is_open_24h
                                ? "Open 24 hours"
                                : `${formatTime(workingHour.open_time)} - ${formatTime(workingHour.close_time)}`}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              workingHour.is_closed
                                ? "bg-destructive/15 text-destructive"
                                : workingHour.is_open_24h
                                  ? "bg-gradient-pill text-primary-foreground shadow-pill"
                                  : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {workingHour.is_closed
                              ? "Closed"
                              : workingHour.is_open_24h
                                ? "Open 24h"
                                : "Scheduled"}
                          </span>
                        </div>

                        {workingHour.break_hour_start &&
                          workingHour.break_hour_end && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Break: {formatTime(workingHour.break_hour_start)}{" "}
                              - {formatTime(workingHour.break_hour_end)}
                            </p>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-secondary p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-card-foreground">
        {value}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
        {children}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="font-medium text-card-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
