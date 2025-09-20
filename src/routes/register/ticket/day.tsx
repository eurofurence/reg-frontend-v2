import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { eachDayOfInterval } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import RadioCard from "../../../components/controls/RadioCard";
import RadioGroup from "../../../components/controls/RadioGroup";
import FullWidthRegisterFunnelLayout from "../../../components/funnels/FullWidthRegisterFunnelLayout";
import config from "../../../config";
import registrationApi from "../../../db/registration";

export const Route = createFileRoute("/register/ticket/day")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const reg = registrationApi.get(queryClient) ?? {};

  const { register, handleSubmit, reset } = useForm({ defaultValues: reg });
  const navigate = useNavigate();

  const days = eachDayOfInterval({
    start: (config.dayTicketStartDate as any).toJSDate
      ? (config.dayTicketStartDate as any).toJSDate()
      : (config.dayTicketStartDate as unknown as Date),
    end: (config.dayTicketEndDate as any).toJSDate
      ? (config.dayTicketEndDate as any).toJSDate()
      : (config.dayTicketEndDate as unknown as Date),
  });

  useEffect(() => reset(reg), [reg, reset]);

  const onSubmit = (data: any) => {
    registrationApi.update(queryClient, { ...data });
    navigate({ to: "/register/ticket/level" as any });
  };

  return (
    <FullWidthRegisterFunnelLayout currentStep={0}>
      <h3>Select your ticket</h3>
      <form id="ticket-day-form" onSubmit={handleSubmit(onSubmit)}>
        <RadioGroup name="day">
          {days.map((d) => (
            <RadioCard key={d.toISOString()} label={d.toDateString()}>
              <label>
                <input
                  type="radio"
                  value={d.toISOString().slice(0, 10)}
                  {...register("day", { required: true })}
                />
              </label>
            </RadioCard>
          ))}
        </RadioGroup>

        <button
          type="button"
          onClick={() => navigate({ to: "/register/ticket/type" as any })}
        >
          Back
        </button>
        <button type="submit">Next</button>
      </form>
    </FullWidthRegisterFunnelLayout>
  );
}
