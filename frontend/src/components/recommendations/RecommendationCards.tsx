import { useEffect, useState } from "react";

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
  if (!value) {
    return "Unspecified day";
  }

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
    if (!isOpenDetails) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpenDetails(false);
      }
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
        className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{name}</h2>
            <p className="mt-1 text-sm text-slate-500">{category}</p>
          </div>
          {typeof isOpen === "boolean" && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isOpen ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {isOpen ? "Open now" : "Closed"}
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          <p>
            Rating: <span className="font-medium text-slate-900">{typeof rating === "number" ? `⭐ ${rating.toFixed(1)}` : "n/a"}</span>
          </p>
          {typeof distanceKm === "number" && (
            <p>
              Distance: <span className="font-medium text-slate-900">{distanceKm.toFixed(2)} km</span>
            </p>
          )}
          {typeof recommendationScore === "number" && (
            <p>
              Score: <span className="font-medium text-slate-900">{recommendationScore.toFixed(3)}</span>
            </p>
          )}
          {typeof userRatingCount === "number" && (
            <p>
              Ratings: <span className="font-medium text-slate-900">{userRatingCount}</span>
            </p>
          )}
        </div>

        {recommendationReason && (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {recommendationReason}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Tap for details
          </p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openDetails();
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Details
          </button>
        </div>
      </article>

      {isOpenDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Full details</p>
                <h3 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">{name}</h3>
                <p className="mt-1 text-sm text-slate-500">{category}{context ? ` · ${context}` : ""}</p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Rating</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{typeof rating === "number" ? `⭐ ${rating.toFixed(1)}` : "n/a"}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{typeof isOpen === "boolean" ? (isOpen ? "Open now" : "Closed now") : "n/a"}</p>
                  </div>
                  {typeof distanceKm === "number" && (
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Distance</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{distanceKm.toFixed(2)} km</p>
                    </div>
                  )}
                  {typeof recommendationScore === "number" && (
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Score</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{recommendationScore.toFixed(3)}</p>
                    </div>
                  )}
                </div>

                {recommendationReason && (
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Why this card is ranked here</p>
                    <p className="mt-2 text-base leading-7">{recommendationReason}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contact</p>
                    <dl className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-slate-900">Phone</dt>
                        <dd>{phone ?? "n/a"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-slate-900">Price</dt>
                        <dd>{priceLevel ?? "n/a"}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Location</p>
                    <dl className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-slate-900">Latitude</dt>
                        <dd>{typeof latitude === "number" ? latitude.toFixed(5) : "n/a"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="font-medium text-slate-900">Longitude</dt>
                        <dd>{typeof longitude === "number" ? longitude.toFixed(5) : "n/a"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Working hours</p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">Weekly schedule</h4>
                  </div>
                  {typeof userRatingCount === "number" && (
                    <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                      {userRatingCount} ratings
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  {workingHours.length === 0 ? (
                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                      No working hours available.
                    </div>
                  ) : (
                    workingHours.map((workingHour) => (
                      <div key={workingHour.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h5 className="font-semibold text-slate-900">{formatDayLabel(workingHour.day_of_week)}</h5>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${workingHour.is_closed ? "bg-rose-100 text-rose-700" : workingHour.is_open_24h ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                            {workingHour.is_closed ? "Closed" : workingHour.is_open_24h ? "Open 24h" : "Scheduled"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {workingHour.is_closed
                            ? "Closed all day"
                            : workingHour.is_open_24h
                              ? "Open 24 hours"
                              : `${formatTime(workingHour.open_time)} - ${formatTime(workingHour.close_time)}`}
                        </p>
                        {workingHour.break_hour_start && workingHour.break_hour_end && (
                          <p className="mt-1 text-sm text-slate-500">
                            Break: {formatTime(workingHour.break_hour_start)} - {formatTime(workingHour.break_hour_end)}
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