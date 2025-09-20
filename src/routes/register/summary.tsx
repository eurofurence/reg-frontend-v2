import { createFileRoute, useNavigate } from "@tanstack/react-router";
import registrationApi from "../../db/registration";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import ticketLevels from "../../data/ticketLevels";
import { submitRegistration } from "../../apis/attsrv";
import { DateTime } from "luxon";

export const Route = createFileRoute("/register/summary")({
  component: RouteComponent,
});

function RouteComponent() {
  const qc = useQueryClient();
  const reg = registrationApi.get(qc) ?? {};
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (r: any) => submitRegistration(r),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["registration"] });
      navigate({ to: "/register/thank-you" as any });
    },
  } as any);

  const calculatePrice = () => {
    let total = 0;
    if (reg.type === "full") {
      const level = reg.level ?? "standard";
      total += ticketLevels.find((t) => t.id === level)?.prices.full ?? 0;
    } else if (reg.type === "day") {
      const level = reg.level ?? "standard";
      total += ticketLevels.find((t) => t.id === level)?.prices.day ?? 0;
    }
    return total;
  };

  const onSubmit = () => {
    mutation.mutate(reg as any);
  };

  const isLoading = (mutation as any).isLoading;
  const isError = (mutation as any).isError;
  const mutationErrorMessage = String(
    (mutation as any).error?.message ?? "Submission failed"
  );

  return (
    <div>
      <h3>Summary</h3>

      <section>
        <h4>Ticket</h4>
        <ul>
          <li>
            <strong>Type:</strong> {reg.type ?? "—"}
          </li>
          {reg.type === "day" && reg.day && (
            <li>
              <strong>Day:</strong>{" "}
              {DateTime.fromISO(String(reg.day)).toLocaleString(
                DateTime.DATE_FULL
              )}
            </li>
          )}
          <li>
            <strong>Level:</strong> {reg.level ?? "standard"}
          </li>
          <li>
            <strong>Price:</strong> €{calculatePrice()}
          </li>
          <li>
            <button
              onClick={() => navigate({ to: "/register/ticket/type" as any })}
            >
              Edit type
            </button>
            <button
              onClick={() => navigate({ to: "/register/ticket/level" as any })}
            >
              Edit level
            </button>
            {reg.type === "day" && (
              <button
                onClick={() => navigate({ to: "/register/ticket/day" as any })}
              >
                Edit day
              </button>
            )}
          </li>
        </ul>
      </section>

      <section>
        <h4>Personal information</h4>
        <ul>
          <li>
            <strong>Nickname:</strong> {reg.nickname ?? "—"}
          </li>
          <li>
            <strong>Full name:</strong>{" "}
            {(reg.firstName ?? "") + " " + (reg.lastName ?? "")}
          </li>
          <li>
            <strong>Show full name:</strong>{" "}
            {reg.fullNamePermission ? "Yes" : "No"}
          </li>
          <li>
            <strong>Date of birth:</strong>{" "}
            {reg.dateOfBirth
              ? DateTime.fromISO(String(reg.dateOfBirth)).toLocaleString(
                  DateTime.DATE_MED
                )
              : "—"}
          </li>
          <li>
            <strong>Spoken languages:</strong>{" "}
            {(reg.spokenLanguages ?? []).join(", ")}
          </li>
          <li>
            <strong>Pronouns:</strong> {reg.pronounsSelection ?? "—"}
            {reg.pronounsSelection === "other" && reg.pronounsOther
              ? ` (${reg.pronounsOther})`
              : ""}
          </li>
          <li>
            <strong>Wheelchair:</strong> {reg.wheelchair ? "Yes" : "No"}
          </li>
          <li>
            <button
              onClick={() => navigate({ to: "/register/personal-info" as any })}
            >
              Edit personal info
            </button>
          </li>
        </ul>
      </section>

      <div style={{ marginTop: 12 }}>
        <button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </button>
        {isError ? (
          <div style={{ color: "red" }}>{mutationErrorMessage}</div>
        ) : null}
      </div>
    </div>
  );
}
