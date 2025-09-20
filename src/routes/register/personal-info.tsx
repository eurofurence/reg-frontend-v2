import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import registrationApi from "../../db/registration";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { DateTime } from "luxon";
import config from "../../config";

export const Route = createFileRoute("/register/personal-info")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const reg = registrationApi.get(queryClient) ?? {};

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: reg });
  const navigate = useNavigate();
  const pronounsSelection = watch("pronounsSelection");

  useEffect(() => reset(reg), [reg, reset]);

  const reAlphaNum = /[\p{Letter}\p{Number}]/gu;
  const alphaNumCount = (s: string) => s.match(reAlphaNum)?.length ?? 0;
  const reSpace = /[\p{White_Space}]/gu;
  const spaceCount = (s: string) => s.match(reSpace)?.length ?? 0;

  const onSubmit = (data: any) => {
    // normalize spokenLanguages: allow comma-separated string -> array
    const spoken =
      typeof data.spokenLanguages === "string"
        ? data.spokenLanguages
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : data.spokenLanguages;
    registrationApi.update(queryClient, { ...data, spokenLanguages: spoken });
    navigate({ to: "/register/summary" as any });
  };

  return (
    <div>
      <h3>Personal information</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Nickname</label>
          <input
            {...register("nickname", {
              required: "Nickname is required",
              maxLength: { value: 80, message: "Max length is 80" },
              validate: {
                noLeadingOrTrailingWhitespace: (v) =>
                  v?.trim() === v || "No leading/trailing whitespace",
                minOneAlphanumericChar: (v) =>
                  alphaNumCount(v ?? "") > 0 ||
                  "Must contain at least one alphanumeric char",
                maxTwoNonAlphanumericChars: (v) =>
                  (v?.length ?? 0) -
                    alphaNumCount(v ?? "") -
                    spaceCount(v ?? "") <=
                    2 || "At most two non-alphanumeric chars",
              },
            })}
          />
          {errors.nickname && (
            <div style={{ color: "red" }}>
              {String(errors.nickname.message)}
            </div>
          )}
        </div>

        <div>
          <label>First name</label>
          <input
            {...register("firstName", {
              required: "First name is required",
              maxLength: { value: 80, message: "Max length is 80" },
            })}
          />
          {errors.firstName && (
            <div style={{ color: "red" }}>
              {String(errors.firstName.message)}
            </div>
          )}
        </div>

        <div>
          <label>Last name</label>
          <input
            {...register("lastName", {
              required: "Last name is required",
              maxLength: { value: 80, message: "Max length is 80" },
            })}
          />
          {errors.lastName && (
            <div style={{ color: "red" }}>
              {String(errors.lastName.message)}
            </div>
          )}
        </div>

        <div>
          <label>
            <input type="checkbox" {...register("fullNamePermission")} /> I
            grant permission to use my full name
          </label>
        </div>

        <div>
          <label>Date of birth</label>
          <input
            type="date"
            {...register("dateOfBirth", {
              required: "Date of birth is required",
              validate: {
                minimumAge: (v) =>
                  DateTime.fromISO(v ?? "", { zone: "Europe/Berlin" }) <=
                    (config.eventStartDate as any).minus({
                      years: config.minimumAge,
                    }) || "You must meet minimum age",
                maximumAge: (v) =>
                  DateTime.fromISO(v ?? "", { zone: "Europe/Berlin" }) >=
                    (config.earliestBirthDate as any) || "Date too old",
              },
            })}
          />
          {errors.dateOfBirth && (
            <div style={{ color: "red" }}>
              {String(errors.dateOfBirth.message)}
            </div>
          )}
        </div>

        <div>
          <label>Spoken languages (comma separated codes)</label>
          <input {...register("spokenLanguages")} placeholder="en,de,fr" />
        </div>

        <div>
          <label>Pronouns</label>
          <div>
            <label>
              <input
                type="radio"
                value="prefer-not-to-say"
                {...register("pronounsSelection", { required: true })}
              />{" "}
              Prefer not to say
            </label>
            <label>
              <input
                type="radio"
                value="He/Him"
                {...register("pronounsSelection", { required: true })}
              />{" "}
              He/Him
            </label>
            <label>
              <input
                type="radio"
                value="She/Her"
                {...register("pronounsSelection", { required: true })}
              />{" "}
              She/Her
            </label>
            <label>
              <input
                type="radio"
                value="They/Them"
                {...register("pronounsSelection", { required: true })}
              />{" "}
              They/Them
            </label>
            <label>
              <input
                type="radio"
                value="other"
                {...register("pronounsSelection", { required: true })}
              />{" "}
              Other
              <input
                {...register("pronounsOther", {
                  required: pronounsSelection === "other",
                  onChange: () => {
                    // typing here should select the "other" radio
                    setValue("pronounsSelection", "other", {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  },
                })}
                placeholder="Xe/Xem"
              />
            </label>
          </div>
        </div>

        <div>
          <label>
            <input type="checkbox" {...register("wheelchair")} /> Please
            accommodate my wheelchair
          </label>
        </div>

        <button type="submit">Next</button>
        <button
          type="button"
          onClick={() => navigate({ to: "/register/ticket/level" as any })}
        >
          Back
        </button>
      </form>
    </div>
  );
}
